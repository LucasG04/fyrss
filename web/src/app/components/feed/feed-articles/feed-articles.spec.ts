import { ConfigService } from '../../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedArticles } from './feed-articles';

describe('FeedArticles', () => {
  let fixture: ComponentFixture<FeedArticles>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeedArticles],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeedArticles);
    fixture.componentRef.setInput('id', '1');
  });

  afterEach(() => httpTesting.verify());

  it('should show the feed and mark it as read', async () => {
    TestBed.tick();
    httpTesting.expectOne('/feeds/1').flush({
      id: '1',
      name: 'Example',
      url: 'https://example.com/feed.xml',
      lastReadAt: '2026-01-01T00:00:00Z',
      articleCount: 0,
    });
    // httpResource settles asynchronously; the follow-up requests start once it has
    await vi.waitFor(() => {
      TestBed.tick();
      httpTesting.expectOne('/feeds/1/read').flush(null);
    });
    httpTesting.expectOne('/feeds/1/paginated?from=0&to=20').flush([]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1').textContent).toBe(
      'Example',
    );
  });

  it('should offer a retry instead of "not found" when loading fails', async () => {
    TestBed.tick();
    httpTesting
      .expectOne('/feeds/1')
      .flush(null, { status: 504, statusText: 'Gateway Timeout' });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h2').textContent).toBe(
      "Couldn't load feed",
    );
  });
});
