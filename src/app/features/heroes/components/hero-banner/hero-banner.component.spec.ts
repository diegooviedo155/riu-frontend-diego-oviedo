import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should render banner title with expected text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('.hero-banner__title');

      expect(title?.textContent?.trim()).toBe('Mantenimiento de Superhéroes');
    });

    it('should render banner subtitle with expected description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const subtitle = compiled.querySelector('.hero-banner__subtitle');

      expect(subtitle?.textContent?.trim()).toBe(
        'Catálogo interactivo y gestión integral de héroes con Angular 19 y Signals.',
      );
    });

    it('should render technical test badge with icon and label text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.hero-banner__badge');
      const badgeIcon = badge?.querySelector('mat-icon');

      expect(badge?.textContent).toContain('Prueba Técnica Frontend · RIU');
      expect(badgeIcon?.textContent?.trim()).toBe('verified');
    });
  });

  describe('Border Cases', () => {
    it('should maintain semantic header element with appropriate container class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('header.hero-banner');
      const container = compiled.querySelector('.hero-banner__container');

      expect(header).toBeTruthy();
      expect(container).toBeTruthy();
    });
  });
});
