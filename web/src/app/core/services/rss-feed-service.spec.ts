import { ConfigService } from './config-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RssFeedService } from './rss-feed-service';

describe('FeedService', () => {
  let service: RssFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    });
    service = TestBed.inject(RssFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
