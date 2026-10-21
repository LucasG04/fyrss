import { ConfigService } from '../../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCard } from './article-card';

describe('ArticleCard', () => {
  let component: ArticleCard;
  let fixture: ComponentFixture<ArticleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCard],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCard);
    fixture.componentRef.setInput('article', {
      id: '1',
      title: 'Title',
      description: 'Description',
      sourceUrl: 'https://example.com',
      sourceType: 'rss',
      publishedAt: '2026-01-01T00:00:00Z',
      lastReadAt: '2026-01-01T00:00:00Z',
      save: false,
      feedId: '1',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
