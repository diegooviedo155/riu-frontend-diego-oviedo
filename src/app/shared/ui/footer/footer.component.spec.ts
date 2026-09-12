import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create the footer component', () => {
      expect(component).toBeTruthy();
    });

    it('should render brand elements correctly', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const riuBadge = compiled.querySelector('.app-footer__riu');
      const brandText = compiled.querySelector('.app-footer__brand-text');

      expect(riuBadge).toBeTruthy();
      expect(riuBadge?.textContent?.trim()).toBe('RIU');
      expect(brandText).toBeTruthy();
      expect(brandText?.textContent?.trim()).toBe('Hotels & Resorts');
    });

    it('should render author attribution text correctly', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footerText = compiled.querySelector('.app-footer__text');

      expect(footerText).toBeTruthy();
      expect(footerText?.textContent).toContain('Prueba Técnica Frontend');
      expect(footerText?.textContent).toContain('Diego Oviedo');
    });
  });
});
