import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create the app component', () => {
      expect(component).toBeTruthy();
    });

    it('should render spinner, navbar and main content container', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('app-spinner')).toBeTruthy();
      expect(compiled.querySelector('app-navbar')).toBeTruthy();
      expect(compiled.querySelector('main.main-content')).toBeTruthy();
    });

    it('should render footer component', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('app-footer')).toBeTruthy();
    });
  });
});
