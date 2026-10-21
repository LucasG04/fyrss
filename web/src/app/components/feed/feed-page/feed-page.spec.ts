import { ConfigService } from '../../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedPage } from './feed-page';

describe('FeedPage', () => {
  let fixture: ComponentFixture<FeedPage>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeedPage);
  });

  afterEach(() => httpTesting.verify());

  it('should show the empty state when there are no feeds', async () => {
    TestBed.tick();
    httpTesting.expectOne('/feeds').flush([]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No feeds found');
  });
});
