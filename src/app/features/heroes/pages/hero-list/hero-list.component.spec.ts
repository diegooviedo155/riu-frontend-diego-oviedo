import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroListComponent } from './hero-list.component';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero } from '../../models';
import { HERO_PAGINATION_CONFIG } from '../../constants/hero.constants';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let router: Router;
  let facadeMock: {
    loadAll: ReturnType<typeof vi.fn>;
    setSearchTerm: ReturnType<typeof vi.fn>;
    setPageIndex: ReturnType<typeof vi.fn>;
    setPageSize: ReturnType<typeof vi.fn>;
    deleteHero: ReturnType<typeof vi.fn>;
    filteredHeroes: any;
    heroes: any;
    searchTerm: any;
    pageIndex: any;
    pageSize: any;
  };
  let dialogMock: {
    open: ReturnType<typeof vi.fn>;
  };

  const sampleHeroes: Hero[] = [
    {
      id: '1',
      name: 'SPIDERMAN',
      alias: 'Peter Parker',
      power: 'Spider-Sense',
      publisher: 'Marvel',
      description: 'Web slinger',
    },
    {
      id: '2',
      name: 'BATMAN',
      alias: 'Bruce Wayne',
      power: 'Martial Arts',
      publisher: 'DC',
      description: 'Dark Knight',
    },
    {
      id: '3',
      name: 'SUPERMAN',
      alias: 'Clark Kent',
      power: 'Flight',
      publisher: 'DC',
      description: 'Man of Steel',
    },
  ];

  const heroesSignal = signal<Hero[]>(sampleHeroes);
  const searchSignal = signal<string>('');
  const pageIndexSignal = signal<number>(0);
  const pageSizeSignal = signal<number>(
    HERO_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  );
  const isLoadingSignal = signal<boolean>(false);

  beforeEach(async () => {
    heroesSignal.set(sampleHeroes);
    searchSignal.set('');
    pageIndexSignal.set(0);
    pageSizeSignal.set(HERO_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    isLoadingSignal.set(false);

    facadeMock = {
      loadAll: vi.fn().mockReturnValue(of(sampleHeroes)),
      setSearchTerm: vi
        .fn()
        .mockImplementation((term: string) => searchSignal.set(term)),
      searchHeroes: vi.fn().mockImplementation((term: string) => {
        searchSignal.set(term);
        return of(sampleHeroes);
      }),
      setPageIndex: vi
        .fn()
        .mockImplementation((index: number) => pageIndexSignal.set(index)),
      setPageSize: vi
        .fn()
        .mockImplementation((size: number) => pageSizeSignal.set(size)),
      deleteHero: vi.fn().mockReturnValue(of(undefined)),
      filteredHeroes: computed(() => heroesSignal()),
      heroes: computed(() => heroesSignal()),
      searchTerm: computed(() => searchSignal()),
      pageIndex: computed(() => pageIndexSignal()),
      pageSize: computed(() => pageSizeSignal()),
      isLoading: computed(() => isLoadingSignal()),
    };

    dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: HeroFacadeService, useValue: facadeMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Happy Path', () => {
    it('should create component and initialize heroes on init', () => {
      expect(component).toBeTruthy();
      expect(facadeMock.loadAll).toHaveBeenCalled();
      expect(component.filteredHeroes().length).toBe(3);
    });

    it('should paginate heroes correctly according to pageSize and pageIndex', () => {
      pageSizeSignal.set(2);
      pageIndexSignal.set(0);

      expect(component.paginatedHeroes().length).toBe(2);
      expect(component.paginatedHeroes()[0].name).toBe('SPIDERMAN');

      component.onPageChange({
        pageIndex: 1,
        pageSize: 2,
        length: 3,
      } as PageEvent);

      expect(facadeMock.setPageIndex).toHaveBeenCalledWith(1);
      expect(facadeMock.setPageSize).toHaveBeenCalledWith(2);
      expect(component.paginatedHeroes().length).toBe(1);
      expect(component.paginatedHeroes()[0].name).toBe('SUPERMAN');
    });

    it('should delegate search change to facade', () => {
      component.onSearchChange('batman');

      expect(facadeMock.searchHeroes).toHaveBeenCalledWith('batman');
    });

    it('should delegate search clear to facade', () => {
      component.onSearchClear();

      expect(facadeMock.searchHeroes).toHaveBeenCalledWith('');
    });

    it('should display loading spinner and hide grid when isLoading is true', async () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const loadingEl = fixture.nativeElement.querySelector(
        '.hero-list__loading',
      );
      expect(loadingEl).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector('.hero-list__grid'),
      ).toBeNull();
    });

    it('should navigate to edit hero route on onEditHero', () => {
      component.onEditHero('1');

      expect(router.navigate).toHaveBeenCalledWith(['/heroes/edit', '1']);
    });

    it('should open confirm dialog and delete hero when confirmed', () => {
      dialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });

      component.confirmDelete(sampleHeroes[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(facadeMock.deleteHero).toHaveBeenCalledWith('1');
    });

    it('should synchronize paginator and adjust pageIndex when deleting the last hero on the last page', () => {
      pageSizeSignal.set(2);
      pageIndexSignal.set(1);
      fixture.detectChanges();

      expect(component.pageIndex()).toBe(1);
      expect(component.paginatedHeroes().length).toBe(1);
      expect(component.paginatedHeroes()[0].name).toBe('SUPERMAN');

      facadeMock.deleteHero.mockImplementation((id: string) => {
        heroesSignal.update((items) => items.filter((h) => h.id !== id));
        const remaining = heroesSignal().length;
        const maxPage = Math.max(
          0,
          Math.ceil(remaining / pageSizeSignal()) - 1,
        );
        if (pageIndexSignal() > maxPage) {
          pageIndexSignal.set(maxPage);
        }
        return of(undefined);
      });

      dialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });

      component.confirmDelete(sampleHeroes[2]);
      fixture.detectChanges();

      expect(facadeMock.deleteHero).toHaveBeenCalledWith('3');
      expect(component.pageIndex()).toBe(0);
      expect(component.paginatedHeroes().length).toBe(2);
      expect(component.filteredHeroes().length).toBe(2);
    });

    it('should render hero card components matching paginated count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('app-hero-card');

      expect(cards.length).toBe(3);
    });

    it('should render hero banner component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const banner = compiled.querySelector('app-hero-banner');

      expect(banner).toBeTruthy();
    });

    it('should render hero paginator component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const paginator = compiled.querySelector('app-hero-paginator');

      expect(paginator).toBeTruthy();
    });
  });

  describe('Bad Path', () => {
    it('should not delete hero when confirm dialog is dismissed', () => {
      dialogMock.open.mockReturnValue({
        afterClosed: () => of(false),
      });

      component.confirmDelete(sampleHeroes[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(facadeMock.deleteHero).not.toHaveBeenCalled();
    });
  });

  describe('Border Cases', () => {
    it('should safely clamp pageIndex within bounds when pageIndex overflows', () => {
      pageSizeSignal.set(2);
      pageIndexSignal.set(99);

      expect(component.paginatedHeroes().length).toBe(1);
      expect(component.paginatedHeroes()[0].name).toBe('SUPERMAN');
    });

    it('should render empty state when filtered heroes list is empty', () => {
      heroesSignal.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyContainer = compiled.querySelector('.hero-list__empty');

      expect(emptyContainer).toBeTruthy();
      expect(
        emptyContainer?.querySelector('.hero-list__empty-title')?.textContent,
      ).toContain('No se encontraron superhéroes');
    });
  });
});
