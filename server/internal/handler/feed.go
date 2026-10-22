package handler

import (
	"context"
	"errors"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/lucasg04/fyrss/server/internal/model"
	"github.com/lucasg04/fyrss/server/internal/service"
)

type FeedHandler struct {
	svc *service.FeedService
}

func NewFeedHandler(svc *service.FeedService) *FeedHandler {
	return &FeedHandler{svc: svc}
}

type FeedIDInput struct {
	ID uuid.UUID `path:"id" doc:"Feed ID"`
}

type CreateFeedInput struct {
	Body model.CreateFeedRequest
}

type UpdateFeedInput struct {
	ID   uuid.UUID `path:"id" doc:"Feed ID"`
	Body model.UpdateFeedRequest
}

type FeedOutput struct {
	Body *model.Feed
}

type FeedsOutput struct {
	Body []*model.Feed
}

func (h *FeedHandler) GetAll(ctx context.Context, _ *struct{}) (*FeedsOutput, error) {
	feeds, err := h.svc.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	return &FeedsOutput{Body: feeds}, nil
}

func (h *FeedHandler) GetByID(ctx context.Context, input *FeedIDInput) (*FeedOutput, error) {
	feed, err := h.svc.GetByID(ctx, input.ID)
	if err != nil {
		return nil, feedError(err)
	}

	return &FeedOutput{Body: feed}, nil
}

func (h *FeedHandler) Create(ctx context.Context, input *CreateFeedInput) (*FeedOutput, error) {
	feed, err := h.svc.Create(ctx, &input.Body)
	if err != nil {
		return nil, feedError(err)
	}

	return &FeedOutput{Body: feed}, nil
}

func (h *FeedHandler) Update(ctx context.Context, input *UpdateFeedInput) (*FeedOutput, error) {
	feed, err := h.svc.Update(ctx, input.ID, &input.Body)
	if err != nil {
		return nil, feedError(err)
	}

	return &FeedOutput{Body: feed}, nil
}

func (h *FeedHandler) Delete(ctx context.Context, input *FeedIDInput) (*struct{}, error) {
	return nil, feedError(h.svc.Delete(ctx, input.ID))
}

func (h *FeedHandler) UpdateLastReadAt(ctx context.Context, input *FeedIDInput) (*struct{}, error) {
	return nil, feedError(h.svc.UpdateLastReadAt(ctx, input.ID))
}

// feedError maps service errors to HTTP errors.
func feedError(err error) error {
	switch {
	case err == nil:
		return nil
	case errors.Is(err, service.ErrInvalidFeedName), errors.Is(err, service.ErrInvalidFeedURL),
		errors.Is(err, service.ErrInvalidRSSFeed), errors.Is(err, service.ErrFeedValidationFail):
		return huma.Error400BadRequest(err.Error())
	case errors.Is(err, service.ErrDuplicateFeedURL):
		return huma.Error409Conflict(err.Error())
	case errors.Is(err, service.ErrFeedNotFound):
		return huma.Error404NotFound(err.Error())
	default:
		return err
	}
}
