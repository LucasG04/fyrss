package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/lucasg04/fyrss/server/internal/handler"
	"github.com/lucasg04/fyrss/server/internal/repository"
	"github.com/lucasg04/fyrss/server/internal/service"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env.dev")
	godotenv.Load(".env.secrets")
	databaseUrl := os.Getenv("DATABASE_URL")
	db, err := sqlx.Connect("postgres", databaseUrl)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// Initialize services
	articleRepo := repository.NewArticleRepository(db)
	articleService := service.NewArticleService(articleRepo)
	feedRepo := repository.NewFeedRepository(db)
	rssReader := service.NewRssArticleReader(articleService)
	feedService := service.NewFeedService(feedRepo, rssReader, articleService)

	runMigrations(databaseUrl)
	go startReadingRssFeeds(feedService)
	go startDeleteOldArticlesJob(articleService)

	startServer(articleService, feedService)
}

func startServer(articleService *service.ArticleService, feedService *service.FeedService) {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	config := huma.DefaultConfig("fyrss API", "1.0.0")
	config.Info.Description = "API of fyrss, an RSS reader that collects articles from configured feeds."
	config.OpenAPIPath = "/api/openapi"
	config.DocsPath = "/api/docs"
	config.SchemasPath = "/api/schemas"
	// keep responses free of the $schema field and Link header
	config.CreateHooks = nil
	api := humachi.New(r, config)

	setupArticleHttpHandler(api, articleService)
	setupFeedHttpHandler(api, feedService, articleService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Server starting on port %s\n", port)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func setupArticleHttpHandler(api huma.API, articleService *service.ArticleService) {
	articleHandler := handler.NewArticleHandler(articleService)
	tags := []string{"Articles"}

	huma.Register(api, huma.Operation{
		OperationID: "list-articles", Method: http.MethodGet, Path: "/api/articles", Tags: tags,
		Summary: "List all articles",
	}, articleHandler.GetAll)
	huma.Register(api, huma.Operation{
		OperationID: "list-article-history", Method: http.MethodGet, Path: "/api/articles/history", Tags: tags,
		Summary:     "List read articles",
		Description: "Articles that have been read, most recently read first, limited to the range [from, to).",
	}, articleHandler.GetHistory)
	huma.Register(api, huma.Operation{
		OperationID: "list-saved-articles", Method: http.MethodGet, Path: "/api/articles/saved", Tags: tags,
		Summary:     "List saved articles",
		Description: "Articles marked as saved, limited to the range [from, to).",
	}, articleHandler.GetSaved)
	huma.Register(api, huma.Operation{
		OperationID: "get-article", Method: http.MethodGet, Path: "/api/articles/{id}", Tags: tags,
		Summary: "Get an article",
	}, articleHandler.GetByID)
	huma.Register(api, huma.Operation{
		OperationID: "set-article-saved", Method: http.MethodPatch, Path: "/api/articles/{id}/saved", Tags: tags,
		Summary: "Save or unsave an article",
	}, articleHandler.UpdateSavedByID)
	huma.Register(api, huma.Operation{
		OperationID: "mark-article-read", Method: http.MethodPatch, Path: "/api/articles/{id}/read", Tags: tags,
		Summary: "Mark an article as read",
	}, articleHandler.UpdateReadByID)
}

func setupFeedHttpHandler(api huma.API, feedService *service.FeedService, articleService *service.ArticleService) {
	feedHandler := handler.NewFeedHandler(feedService)
	articleHandler := handler.NewArticleHandler(articleService)
	tags := []string{"Feeds"}

	huma.Register(api, huma.Operation{
		OperationID: "list-feeds", Method: http.MethodGet, Path: "/api/feeds", Tags: tags,
		Summary: "List all feeds",
	}, feedHandler.GetAll)
	huma.Register(api, huma.Operation{
		OperationID: "get-feed", Method: http.MethodGet, Path: "/api/feeds/{id}", Tags: tags,
		Summary: "Get a feed",
	}, feedHandler.GetByID)
	huma.Register(api, huma.Operation{
		OperationID: "create-feed", Method: http.MethodPost, Path: "/api/feeds", Tags: tags,
		Summary:       "Create a feed",
		Description:   "The URL must return a valid RSS/Atom feed and must not already exist. Its articles are fetched right after creation.",
		DefaultStatus: http.StatusCreated,
	}, feedHandler.Create)
	huma.Register(api, huma.Operation{
		OperationID: "update-feed", Method: http.MethodPut, Path: "/api/feeds/{id}", Tags: tags,
		Summary:     "Update a feed",
		Description: "The URL must return a valid RSS/Atom feed and must not belong to another feed.",
	}, feedHandler.Update)
	huma.Register(api, huma.Operation{
		OperationID: "delete-feed", Method: http.MethodDelete, Path: "/api/feeds/{id}", Tags: tags,
		Summary:     "Delete a feed",
		Description: "Articles of the feed are kept, their feedId is set to null.",
	}, feedHandler.Delete)
	huma.Register(api, huma.Operation{
		OperationID: "mark-feed-read", Method: http.MethodPatch, Path: "/api/feeds/{id}/read", Tags: tags,
		Summary: "Mark a feed as read",
	}, feedHandler.UpdateLastReadAt)
	huma.Register(api, huma.Operation{
		OperationID: "list-feed-articles", Method: http.MethodGet, Path: "/api/feeds/{feedId}/paginated", Tags: tags,
		Summary:     "List articles of a feed",
		Description: "Articles of the feed, limited to the range [from, to).",
	}, articleHandler.GetPaginatedByFeedID)
}

func runMigrations(dbUrl string) {
	m, err := migrate.New(
		"file://db/migrations", dbUrl,
	)
	if err != nil {
		log.Fatal("Failed to create migration instance:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Failed to apply migrations:", err)
	}
	log.Println("Database migrations applied successfully")
}

func startReadingRssFeeds(feedService *service.FeedService) {
	intervalInMs := os.Getenv("RSS_FEED_INTERVAL_MS")
	if intervalInMs == "" {
		intervalInMs = "7200000" // Default to 2 hours
	}
	interval, err := strconv.Atoi(intervalInMs)
	if err != nil {
		log.Fatalf("Invalid RSS_FEED_INTERVAL_MS: %s", intervalInMs)
	}

	fmt.Printf("Starting RSS feed reader with interval: %d ms\n", interval)
	ticker := time.NewTicker(time.Duration(interval) * time.Millisecond)

	processRssFeeds(feedService) // Initial processing before starting the ticker
	for range ticker.C {
		processRssFeeds(feedService)
	}
}

func processRssFeeds(feedService *service.FeedService) {
	// Get all feeds from database
	feeds, err := feedService.GetAll(context.Background())
	if err != nil {
		log.Printf("Error getting feeds from database: %v\n", err)
		return
	}

	if len(feeds) == 0 {
		log.Println("No feeds configured in database")
		return
	}

	fmt.Printf("Starting scheduled processing of %d feeds\n", len(feeds))

	// TODO: add parallel processing for feeds
	for _, feed := range feeds {
		// cancel article read after 30 seconds to avoid blocking
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

		err := feedService.ProcessFeedNow(ctx, feed)
		if err != nil {
			log.Printf("Error processing RSS feed %s (%s): %v\n", feed.Name, feed.URL, err)
		}

		cancel()
	}

	fmt.Println("Finished scheduled RSS feed processing cycle")
}

func startDeleteOldArticlesJob(articleService *service.ArticleService) {
	interval := 24 * time.Hour // Default to 24 hours
	ticker := time.NewTicker(interval)

	for range ticker.C {
		err := articleService.DeleteOneWeekOldArticles(context.Background())
		if err != nil {
			log.Printf("Error deleting old articles: %v\n", err)
		} else {
			log.Println("Deleted articles older than one week")
		}
	}
}
