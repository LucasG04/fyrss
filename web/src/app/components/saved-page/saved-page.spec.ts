import { ConfigService } from '../../core/services/config-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPage } from './saved-page';

describe('SavedPage', () => {
  let component: SavedPage;
  let fixture: ComponentFixture<SavedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedPage],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { config: { apiUrl: '' } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
