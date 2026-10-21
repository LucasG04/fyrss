import { Component, effect, inject, input, untracked } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { firstValueFrom } from 'rxjs';
import { Article } from '../../../shared/types/article';
import { RssFeedService } from '../../../core/services/rss-feed-service';
import { ArticleList } from '../../../shared/components/article-list/article-list';
import { Location } from '@angular/common';
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-feed-articles',
  imports: [ArticleList, Loader],
  templateUrl: './feed-articles.html',
  styleUrl: './feed-articles.css',
})
export class FeedArticles {
  readonly location = inject(Location);
  private readonly articleService = inject(ArticleService);
  private readonly rssFeedService = inject(RssFeedService);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  readonly rssFeed = this.rssFeedService.byIdResource(this.id);

  constructor() {
    effect(() => {
      if (this.rssFeed.hasValue()) {
        untracked(() =>
          firstValueFrom(this.rssFeedService.setLastReadToNow(this.id())),
        );
      }
    });
  }

  getFeed = (from: number, to: number): Promise<Article[]> =>
    firstValueFrom(this.articleService.getPaginatedFeed(this.id(), from, to));
}
