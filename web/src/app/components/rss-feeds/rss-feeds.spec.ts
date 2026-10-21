import { ConfigService } from '../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssFeeds } from './rss-feeds';

describe('RssFeeds', () => {
  let component: RssFeeds;
  let fixture: ComponentFixture<RssFeeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RssFeeds],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RssFeeds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
