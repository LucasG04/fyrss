package model

import (
	"time"

	"github.com/google/uuid"
)

var DefaultNilTime time.Time

type Article struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	ContentHash string     `json:"-" db:"content_hash"`
	SourceUrl   string     `json:"sourceUrl" db:"source_url"`
	SourceType  string     `json:"sourceType" db:"source_type" enum:"rss,scraped" doc:"Type of source the article came from"`
	PublishedAt time.Time  `json:"publishedAt" db:"published_at"`
	LastReadAt  time.Time  `json:"lastReadAt" db:"last_read_at" doc:"When the article was last read, zero time if never"`
	Save        bool       `json:"save" db:"save" doc:"Whether the article is saved"`
	FeedID      *uuid.UUID `json:"feedId,omitempty" db:"feed_id" doc:"Source feed, missing if the feed was deleted"`
}

type MinimalFeedArticle struct {
	ID          uuid.UUID `db:"id"`
	Description string    `db:"description"`
	PublishedAt time.Time `db:"published_at"`
}
