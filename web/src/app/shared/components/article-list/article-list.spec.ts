import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleList } from './article-list';

describe('ArticleList', () => {
  let component: ArticleList;
  let fixture: ComponentFixture<ArticleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
