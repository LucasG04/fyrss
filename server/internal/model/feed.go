package model

import (
	"time"

	"github.com/google/uuid"
)

type Feed struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	URL          string    `json:"url" db:"url"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
	LastReadAt   time.Time `json:"lastReadAt" db:"last_read_at" doc:"When the feed was last marked as read"`
	ArticleCount int       `json:"articleCount" db:"-" doc:"Number of articles of the feed"`
}

type CreateFeedRequest struct {
	Name string `json:"name" minLength:"1" doc:"Display name of the feed"`
	URL  string `json:"url" format:"uri" doc:"URL of an RSS/Atom feed"`
}

type UpdateFeedRequest struct {
	// the web app sends the full feed object, so unknown fields must be accepted
	_    struct{} `json:"-" additionalProperties:"true"`
	Name string   `json:"name" minLength:"1" doc:"Display name of the feed"`
	URL  string   `json:"url" format:"uri" doc:"URL of an RSS/Atom feed"`
}
