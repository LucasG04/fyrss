import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleList } from './article-list';

describe('ArticleList', () => {
  let component: ArticleList;
  let fixture: ComponentFixture<ArticleList>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ArticleList],
    });

    fixture = TestBed.createComponent(ArticleList);
    fixture.componentRef.setInput('getArticles', () => Promise.resolve([]));
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
