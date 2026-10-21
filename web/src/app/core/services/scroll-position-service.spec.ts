import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollPositionService } from './scroll-position-service';

describe('ScrollPositionService', () => {
  let service: ScrollPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ScrollPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
