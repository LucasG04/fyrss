import { ConfigService } from '../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssFeeds } from './rss-feeds';

describe('RssFeeds', () => {
  let fixture: ComponentFixture<RssFeeds>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RssFeeds],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RssFeeds);
  });

  afterEach(() => httpTesting.verify());

  it('should list loaded feeds', async () => {
    TestBed.tick();
    httpTesting.expectOne('/feeds').flush([
      {
        id: '1',
        name: 'Example',
        url: 'https://example.com/feed.xml',
        lastReadAt: '2026-01-01T00:00:00Z',
        articleCount: 0,
      },
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      'https://example.com/feed.xml',
    );
  });
});
