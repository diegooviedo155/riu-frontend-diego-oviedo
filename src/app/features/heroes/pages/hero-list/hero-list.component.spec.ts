import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HeroListComponent,
  getSpanishPaginatorIntl,
} from './hero-list.component';
import { HeroFacadeService } from '../../services/hero-facade.service';
import { Hero } from '../../models';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let router: Router;
  let facadeMock: {
    loadAll: ReturnType<typeof vi.fn>;
    setSearchTerm: ReturnType<typeof vi.fn>;
    deleteHero: ReturnType<typeof vi.fn>;
    filteredHeroes: any;
    heroes: any;
    searchTerm: any;
  };
  let dialogMock: {
    open: ReturnType<typeof vi.fn>;
  };
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

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

  beforeEach(async () => {
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    heroesSignal.set(sampleHeroes);
    searchSignal.set('');

    facadeMock = {
      loadAll: vi.fn().mockReturnValue(of(sampleHeroes)),
      setSearchTerm: vi
        .fn()
        .mockImplementation((term: string) => searchSignal.set(term)),
      deleteHero: vi.fn().mockReturnValue(of(undefined)),
      filteredHeroes: computed(() => heroesSignal()),
      heroes: computed(() => heroesSignal()),
      searchTerm: computed(() => searchSignal()),
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
      component.pageSize.set(2);
      component.pageIndex.set(0);

      expect(component.paginatedHeroes().length).toBe(2);
      expect(component.paginatedHeroes()[0].name).toBe('SPIDERMAN');

      component.onPageChange({
        pageIndex: 1,
        pageSize: 2,
        length: 3,
      } as PageEvent);

      expect(component.pageIndex()).toBe(1);
      expect(component.pageSize()).toBe(2);
      expect(component.paginatedHeroes().length).toBe(1);
      expect(component.paginatedHeroes()[0].name).toBe('SUPERMAN');
      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('should delegate search change to facade and reset pageIndex to 0', () => {
      component.pageIndex.set(2);

      component.onSearchChange('batman');

      expect(facadeMock.setSearchTerm).toHaveBeenCalledWith('batman');
      expect(component.pageIndex()).toBe(0);
    });

    it('should delegate search clear to facade and reset pageIndex to 0', () => {
      component.pageIndex.set(1);

      component.onSearchClear();

      expect(facadeMock.setSearchTerm).toHaveBeenCalledWith('');
      expect(component.pageIndex()).toBe(0);
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

    it('should render hero card components matching paginated count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('app-hero-card');

      expect(cards.length).toBe(3);
    });

    it('should render hero banner with title and badge', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bannerTitle = compiled.querySelector('.hero-banner__title');
      const bannerBadge = compiled.querySelector('.hero-banner__badge');

      expect(bannerTitle?.textContent).toBe('Mantenimiento de Superhéroes');
      expect(bannerBadge?.textContent).toContain(
        'Prueba Técnica Frontend · RIU',
      );
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

    it('should maintain scroll position and not trigger window scroll during page change', () => {
      component.onPageChange({
        pageIndex: 0,
        pageSize: 6,
        length: 10,
      } as PageEvent);

      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  describe('Border Cases', () => {
    it('should safely clamp pageIndex within bounds when pageIndex overflows', () => {
      component.pageSize.set(2);
      component.pageIndex.set(99);

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

    it('should provide spanish labels and handle range boundaries in getSpanishPaginatorIntl', () => {
      const intl = getSpanishPaginatorIntl();

      expect(intl.itemsPerPageLabel).toBe('Héroes por página:');
      expect(intl.nextPageLabel).toBe('Página siguiente');
      expect(intl.previousPageLabel).toBe('Página anterior');
      expect(intl.firstPageLabel).toBe('Primera página');
      expect(intl.lastPageLabel).toBe('Última página');
      expect(intl.getRangeLabel(0, 6, 20)).toBe('1 – 6 de 20');
      expect(intl.getRangeLabel(3, 6, 20)).toBe('19 – 20 de 20');
      expect(intl.getRangeLabel(0, 6, 0)).toBe('0 de 0');
      expect(intl.getRangeLabel(0, 0, 10)).toBe('0 de 10');
    });
  });
});
