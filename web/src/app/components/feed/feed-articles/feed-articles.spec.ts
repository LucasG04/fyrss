import { ConfigService } from '../../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedArticles } from './feed-articles';

describe('FeedArticles', () => {
  let component: FeedArticles;
  let fixture: ComponentFixture<FeedArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedArticles],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
