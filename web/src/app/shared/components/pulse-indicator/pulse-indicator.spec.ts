import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseIndicator } from './pulse-indicator';

describe('PulseIndicator', () => {
  let component: PulseIndicator;
  let fixture: ComponentFixture<PulseIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PulseIndicator],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PulseIndicator);
    fixture.componentRef.setInput('isActive', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
