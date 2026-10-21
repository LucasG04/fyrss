import {
  HttpClient,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service';
import { RssFeed } from '../../shared/types/rss-feed';

@Service()
export class RssFeedService {
  private readonly configService = inject(ConfigService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.configService.config.apiUrl;

  /** Must be called in an injection context, e.g. a component field initializer. */
  allResource(): HttpResourceRef<RssFeed[] | undefined> {
    return httpResource<RssFeed[]>(() => `${this.apiUrl}/feeds`);
  }

  /** Must be called in an injection context, e.g. a component field initializer. */
  byIdResource(id: () => string): HttpResourceRef<RssFeed | undefined> {
    return httpResource<RssFeed>(() => `${this.apiUrl}/feeds/${id()}`);
  }

  getAll(): Observable<RssFeed[]> {
    return this.http.get<RssFeed[]>(`${this.apiUrl}/feeds`);
  }

  create(feed: Pick<RssFeed, 'name' | 'url'>): Observable<RssFeed> {
    return this.http.post<RssFeed>(`${this.apiUrl}/feeds`, feed);
  }

  update(feed: RssFeed): Observable<RssFeed> {
    return this.http.put<RssFeed>(`${this.apiUrl}/feeds/${feed.id}`, feed);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/feeds/${id}`);
  }

  setLastReadToNow(feedId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/feeds/${feedId}/read`, {});
  }
}
