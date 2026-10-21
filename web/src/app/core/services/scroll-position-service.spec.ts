import { TestBed } from '@angular/core/testing';
import { ScrollPositionService } from './scroll-position-service';

describe('ScrollPositionService', () => {
  let service: ScrollPositionService;

  beforeEach(() => {
    service = TestBed.inject(ScrollPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
