import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseIndicator } from './pulse-indicator';

describe('PulseIndicator', () => {
  let component: PulseIndicator;
  let fixture: ComponentFixture<PulseIndicator>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PulseIndicator],
    });

    fixture = TestBed.createComponent(PulseIndicator);
    fixture.componentRef.setInput('isActive', false);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
