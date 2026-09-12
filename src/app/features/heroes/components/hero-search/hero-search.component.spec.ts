import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HeroSearchComponent } from './hero-search.component';
import { SEARCH_DEBOUNCE_TIME_MS } from '../../constants/hero.constants';

describe('HeroSearchComponent', () => {
  let component: HeroSearchComponent;
  let fixture: ComponentFixture<HeroSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Happy Path', () => {
    it('should create component and initialize input with empty string by default', () => {
      expect(component).toBeTruthy();
      expect(component.searchControl.value).toBe('');
    });

    it('should emit searchChange with debounce when user types', () => {
      vi.useFakeTimers();
      const searchSpy = vi.spyOn(component.searchChange, 'emit');

      component.searchControl.setValue('spider');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS);

      expect(searchSpy).toHaveBeenCalledWith('spider');
    });

    it('should clear input and emit clear event on onClear call', () => {
      const clearSpy = vi.spyOn(component.clear, 'emit');
      component.searchControl.setValue('batman');
      fixture.detectChanges();

      component.onClear();

      expect(component.searchControl.value).toBe('');
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('should render clear button only when input has content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-search__clear-btn')).toBeNull();

      component.searchControl.setValue('superman');
      fixture.detectChanges();

      expect(compiled.querySelector('.hero-search__clear-btn')).toBeTruthy();
    });
  });

  describe('Bad Path', () => {
    it('should not emit searchChange before debounce time elapses', () => {
      vi.useFakeTimers();
      const searchSpy = vi.spyOn(component.searchChange, 'emit');

      component.searchControl.setValue('iron');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS - 50);

      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should not emit duplicate values when identical term is entered', () => {
      vi.useFakeTimers();
      const searchSpy = vi.spyOn(component.searchChange, 'emit');

      component.searchControl.setValue('hulk');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS);
      expect(searchSpy).toHaveBeenCalledTimes(1);

      component.searchControl.setValue('hulk');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS);
      expect(searchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Border Cases', () => {
    it('should sync searchControl when searchTerm input property changes via ngOnChanges', () => {
      component.searchTerm = 'thor';
      component.ngOnChanges({
        searchTerm: new SimpleChange('', 'thor', false),
      });

      expect(component.searchControl.value).toBe('thor');
    });

    it('should ignore first change in ngOnChanges', () => {
      component.searchControl.setValue('initial');
      component.searchTerm = 'new';
      component.ngOnChanges({
        searchTerm: new SimpleChange('', 'new', true),
      });

      expect(component.searchControl.value).toBe('initial');
    });

    it('should emit empty string when user erases input', () => {
      vi.useFakeTimers();
      const searchSpy = vi.spyOn(component.searchChange, 'emit');

      component.searchControl.setValue('flash');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS);

      component.searchControl.setValue('');
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_TIME_MS);

      expect(searchSpy).toHaveBeenLastCalledWith('');
    });
  });
});
