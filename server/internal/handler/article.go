package handler

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/lucasg04/fyrss/server/internal/model"
	"github.com/lucasg04/fyrss/server/internal/service"
)

type ArticleHandler struct {
	svc service.ArticleService
}

func NewArticleHandler(svc *service.ArticleService) *ArticleHandler {
	return &ArticleHandler{svc: *svc}
}

type ArticleIDInput struct {
	ID uuid.UUID `path:"id" doc:"Article ID"`
}

type PaginationInput struct {
	From int `query:"from" required:"true" minimum:"0" doc:"Start index (inclusive)"`
	To   int `query:"to" required:"true" minimum:"1" doc:"End index (exclusive), must be greater than from"`
}

type FeedArticlesInput struct {
	FeedID uuid.UUID `path:"feedId" doc:"Feed ID"`
	PaginationInput
}

type UpdateSavedInput struct {
	ID    uuid.UUID `path:"id" doc:"Article ID"`
	Saved bool      `query:"saved" doc:"Whether the article is saved"`
}

type ArticleOutput struct {
	Body *model.Article
}

type ArticlesOutput struct {
	Body []*model.Article
}

func (h *ArticleHandler) GetAll(ctx context.Context, _ *struct{}) (*ArticlesOutput, error) {
	articles, err := h.svc.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	return &ArticlesOutput{Body: articles}, nil
}

func (h *ArticleHandler) GetByID(ctx context.Context, input *ArticleIDInput) (*ArticleOutput, error) {
	article, err := h.svc.GetByID(ctx, input.ID)
	if err != nil {
		return nil, huma.Error404NotFound(err.Error())
	}

	return &ArticleOutput{Body: article}, nil
}

func (h *ArticleHandler) GetHistory(ctx context.Context, input *PaginationInput) (*ArticlesOutput, error) {
	if err := input.validate(); err != nil {
		return nil, err
	}

	articles, err := h.svc.GetHistoryPaginated(ctx, input.From, input.To)
	if err != nil {
		return nil, err
	}

	return &ArticlesOutput{Body: articles}, nil
}

func (h *ArticleHandler) GetSaved(ctx context.Context, input *PaginationInput) (*ArticlesOutput, error) {
	if err := input.validate(); err != nil {
		return nil, err
	}

	articles, err := h.svc.GetSavedPaginated(ctx, input.From, input.To)
	if err != nil {
		return nil, err
	}

	return &ArticlesOutput{Body: articles}, nil
}

func (h *ArticleHandler) UpdateSavedByID(ctx context.Context, input *UpdateSavedInput) (*struct{}, error) {
	return nil, h.svc.UpdateSavedByID(ctx, input.ID, input.Saved)
}

func (h *ArticleHandler) UpdateReadByID(ctx context.Context, input *ArticleIDInput) (*struct{}, error) {
	return nil, h.svc.UpdateReadByID(ctx, input.ID)
}

func (h *ArticleHandler) GetPaginatedByFeedID(ctx context.Context, input *FeedArticlesInput) (*ArticlesOutput, error) {
	if err := input.validate(); err != nil {
		return nil, err
	}

	articles, err := h.svc.GetPaginatedByFeedID(ctx, input.FeedID, input.From, input.To)
	if err != nil {
		return nil, err
	}

	return &ArticlesOutput{Body: articles}, nil
}

func (p *PaginationInput) validate() error {
	if p.To <= p.From {
		return huma.Error400BadRequest("to must be greater than from")
	}
	return nil
}
