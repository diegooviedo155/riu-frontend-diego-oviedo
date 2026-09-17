import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HeroPaginatorComponent,
  getSpanishPaginatorIntl,
} from './hero-paginator.component';
import { HERO_PAGINATION_CONFIG } from '../../constants/hero.constants';

describe('HeroPaginatorComponent', () => {
  let component: HeroPaginatorComponent;
  let fixture: ComponentFixture<HeroPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroPaginatorComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroPaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('length', 50);
    fixture.componentRef.setInput('pageSize', 6);
    fixture.componentRef.setInput('pageIndex', 0);
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create component and bind input properties', () => {
      expect(component).toBeTruthy();
      expect(component.length()).toBe(50);
      expect(component.pageSize()).toBe(6);
      expect(component.pageIndex()).toBe(0);
      expect(component.pageSizeOptions()).toEqual(
        HERO_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS,
      );
    });

    it('should emit pageChange event when page changes', () => {
      const pageSpy = vi.spyOn(component.pageChange, 'emit');
      const event: PageEvent = {
        pageIndex: 1,
        pageSize: 6,
        length: 50,
      };

      component.pageChange.emit(event);

      expect(pageSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('Border Cases', () => {
    it('should accept custom pageSizeOptions input', () => {
      const customOptions = [10, 20, 30] as const;
      fixture.componentRef.setInput('pageSizeOptions', customOptions);
      fixture.detectChanges();

      expect(component.pageSizeOptions()).toEqual(customOptions);
    });

    it('should provide spanish labels and handle range boundaries in getSpanishPaginatorIntl', () => {
      const intl = getSpanishPaginatorIntl();

      expect(intl.itemsPerPageLabel).toBe('Héroes por página:');
      expect(intl.nextPageLabel).toBe('Página siguiente');
      expect(intl.previousPageLabel).toBe('Página anterior');
      expect(intl.firstPageLabel).toBe('Primera página');
      expect(intl.lastPageLabel).toBe('Última página');
      expect(intl.getRangeLabel(0, 6, 20)).toBe('1 – 6 de 20');
      expect(intl.getRangeLabel(3, 6, 20)).toBe('19 – 20 de 20');
      expect(intl.getRangeLabel(5, 6, 20)).toBe('19 – 20 de 20');
      expect(intl.getRangeLabel(0, 6, 0)).toBe('0 de 0');
      expect(intl.getRangeLabel(0, 0, 10)).toBe('0 de 10');
    });
  });
});
