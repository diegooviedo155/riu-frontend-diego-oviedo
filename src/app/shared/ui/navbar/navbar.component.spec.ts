import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create navbar component', () => {
      expect(component).toBeTruthy();
    });

    it('should render brand link and title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const brandLink = compiled.querySelector('a.brand');
      const brandTitle = compiled.querySelector('.brand-title');

      expect(brandLink).toBeTruthy();
      expect(brandTitle?.textContent).toBe('Heroes');
    });
  });
});
