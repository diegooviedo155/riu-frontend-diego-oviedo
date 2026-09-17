import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroFacadeService } from './hero-facade.service';
import { HeroApiService } from './hero-api.service';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';
import { HERO_PAGINATION_CONFIG } from '../constants/hero.constants';

describe('HeroFacadeService', () => {
  let facade: HeroFacadeService;
  let apiMock: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    searchByName: ReturnType<typeof vi.fn>;
  };

  const mockHeroes: Hero[] = [
    {
      id: '1',
      name: 'SPIDERMAN',
      alias: 'Peter Parker',
      power: 'Spider-Sense',
      publisher: 'Marvel',
    },
    {
      id: '2',
      name: 'SUPERMAN',
      alias: 'Clark Kent',
      power: 'Flight',
      publisher: 'DC',
    },
  ];

  beforeEach(() => {
    apiMock = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      searchByName: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HeroFacadeService,
        { provide: HeroApiService, useValue: apiMock },
      ],
    });

    facade = TestBed.inject(HeroFacadeService);
  });

  describe('Happy Path', () => {
    it('should update heroes and filteredHeroes signals when loadAll completes', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));

      facade.loadAll().subscribe();

      expect(facade.heroes().length).toBe(2);
      expect(facade.filteredHeroes().length).toBe(2);
      expect(facade.heroes()).toEqual(mockHeroes);
    });

    it('should reflect loading state as false by default when no requests are active', () => {
      expect(facade.isLoading()).toBe(false);
    });

    it('should delegate getHeroById to api service', () => {
      apiMock.getById.mockReturnValue(of(mockHeroes[0]));
      let result: Hero | undefined;

      facade.getHeroById('1').subscribe((hero) => {
        result = hero;
      });

      expect(apiMock.getById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockHeroes[0]);
    });

    it('should delegate searchHeroes to api.searchByName and update searchTerm', () => {
      apiMock.searchByName.mockReturnValue(of([mockHeroes[0]]));
      let result: Hero[] | undefined;

      facade.searchHeroes('spider').subscribe((heroes) => {
        result = heroes;
      });

      expect(apiMock.searchByName).toHaveBeenCalledWith('spider');
      expect(facade.searchTerm()).toBe('spider');
      expect(facade.pageIndex()).toBe(0);
      expect(result).toEqual([mockHeroes[0]]);
      expect(facade.filteredHeroes()).toEqual([mockHeroes[0]]);
    });

    it('should append created hero to state upon creation', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      const newHeroDto: HeroCreateDto = {
        name: 'BATMAN',
        alias: 'Bruce Wayne',
        power: 'Martial Arts',
        publisher: 'DC',
      };
      const createdHero: Hero = { id: '3', ...newHeroDto };
      apiMock.create.mockReturnValue(of(createdHero));

      facade.createHero(newHeroDto).subscribe();

      expect(facade.heroes().length).toBe(3);
      expect(facade.heroes()).toContain(createdHero);
    });

    it('should update hero in state upon modification', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      const updateDto: HeroUpdateDto = { alias: 'Miles Morales' };
      const updatedHero: Hero = { ...mockHeroes[0], alias: 'Miles Morales' };
      apiMock.update.mockReturnValue(of(updatedHero));

      facade.updateHero('1', updateDto).subscribe();

      const hero = facade.heroes().find((item) => item.id === '1');
      expect(hero?.alias).toBe('Miles Morales');
    });

    it('should remove hero from state upon deletion', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      apiMock.delete.mockReturnValue(of(undefined));

      facade.deleteHero('1').subscribe();

      expect(facade.heroes().length).toBe(1);
      expect(facade.heroes().find((item) => item.id === '1')).toBeUndefined();
    });

    it('should update pageIndex when setPageIndex is called', () => {
      facade.setPageIndex(2);

      expect(facade.pageIndex()).toBe(2);
    });

    it('should update pageSize when setPageSize is called', () => {
      facade.setPageSize(12);

      expect(facade.pageSize()).toBe(12);
    });

    it('should reset pageIndex to 0 and set search term when setSearchTerm is called', () => {
      facade.setPageIndex(3);

      facade.setSearchTerm('batman');

      expect(facade.searchTerm()).toBe('batman');
      expect(facade.pageIndex()).toBe(0);
    });

    it('should preserve search term and pageIndex when loadAll executes', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.setSearchTerm('spider');
      facade.setPageIndex(2);

      facade.loadAll().subscribe();

      expect(facade.searchTerm()).toBe('spider');
      expect(facade.pageIndex()).toBe(2);
    });
  });

  describe('Bad Path', () => {
    it('should propagate error when loadAll fails without mutating existing state', () => {
      const errorObj = new Error('Failed to load');
      apiMock.getAll.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      facade.loadAll().subscribe({
        error: (err) => {
          capturedError = err;
        },
      });

      expect(capturedError).toBe(errorObj);
      expect(facade.heroes()).toEqual([]);
    });

    it('should propagate error when createHero fails without adding to state', () => {
      const errorObj = new Error('Failed to create');
      apiMock.create.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      facade
        .createHero({ name: 'FAIL', alias: 'None', power: 'None' })
        .subscribe({
          error: (err) => {
            capturedError = err;
          },
        });

      expect(capturedError).toBe(errorObj);
      expect(facade.heroes()).toEqual([]);
    });

    it('should propagate error when deleteHero fails without removing from state', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      const errorObj = new Error('Failed to delete');
      apiMock.delete.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      facade.deleteHero('1').subscribe({
        error: (err) => {
          capturedError = err;
        },
      });

      expect(capturedError).toBe(errorObj);
      expect(facade.heroes().length).toBe(2);
    });
  });

  describe('Border Cases', () => {
    it('should initialize with default pagination and empty filter signals', () => {
      expect(facade.heroes()).toEqual([]);
      expect(facade.searchTerm()).toBe('');
      expect(facade.filteredHeroes()).toEqual([]);
      expect(facade.pageIndex()).toBe(0);
      expect(facade.pageSize()).toBe(HERO_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE);
    });

    it('should handle case-insensitive search filtering', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();

      facade.setSearchTerm('sPiDeR');

      expect(facade.searchTerm()).toBe('sPiDeR');
      expect(facade.filteredHeroes().length).toBe(1);
      expect(facade.filteredHeroes()[0].name).toBe('SPIDERMAN');
    });

    it('should return all heroes when search term contains only whitespaces', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();

      facade.setSearchTerm('     ');

      expect(facade.filteredHeroes().length).toBe(2);
    });

    it('should return empty filteredHeroes when search term does not match any hero', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();

      facade.setSearchTerm('nonexistent-character');

      expect(facade.filteredHeroes().length).toBe(0);
    });

    it('should not alter heroes when updating a non-existent hero id', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      const updateDto: HeroUpdateDto = { name: 'GHOST' };
      const nonExistentHero: Hero = {
        id: '999',
        name: 'GHOST',
        alias: 'Ghost',
        power: 'Phasing',
      };
      apiMock.update.mockReturnValue(of(nonExistentHero));

      facade.updateHero('999', updateDto).subscribe();

      expect(facade.heroes().length).toBe(2);
      expect(facade.heroes().find((item) => item.id === '999')).toBeUndefined();
    });

    it('should not alter heroes when deleting a non-existent hero id', () => {
      apiMock.getAll.mockReturnValue(of(mockHeroes));
      facade.loadAll().subscribe();
      apiMock.delete.mockReturnValue(of(undefined));

      facade.deleteHero('999').subscribe();

      expect(facade.heroes().length).toBe(2);
    });

    it('should match heroes using diacritics normalization for both name and alias', () => {
      const accentedHeroes: Hero[] = [
        {
          id: '1',
          name: 'CAPITÁN AMÉRICA',
          alias: 'Stéve Ríogers',
          power: 'Shield',
        },
        {
          id: '2',
          name: 'SPIDERMAN',
          alias: 'Peter Parker',
          power: 'Spider-Sense',
        },
      ];
      apiMock.getAll.mockReturnValue(of(accentedHeroes));
      facade.loadAll().subscribe();

      facade.setSearchTerm('capitan america');
      expect(facade.filteredHeroes().length).toBe(1);
      expect(facade.filteredHeroes()[0].name).toBe('CAPITÁN AMÉRICA');

      facade.setSearchTerm('spíder');
      expect(facade.filteredHeroes().length).toBe(1);
      expect(facade.filteredHeroes()[0].name).toBe('SPIDERMAN');

      facade.setSearchTerm('péter');
      expect(facade.filteredHeroes().length).toBe(1);
      expect(facade.filteredHeroes()[0].name).toBe('SPIDERMAN');

      facade.setSearchTerm('steve');
      expect(facade.filteredHeroes().length).toBe(1);
      expect(facade.filteredHeroes()[0].name).toBe('CAPITÁN AMÉRICA');
    });

    it('should adjust pageIndex to previous page when deleting the only hero on the last page', () => {
      const threeHeroes: Hero[] = [
        { id: '1', name: 'HERO 1', alias: 'A1', power: 'P1' },
        { id: '2', name: 'HERO 2', alias: 'A2', power: 'P2' },
        { id: '3', name: 'HERO 3', alias: 'A3', power: 'P3' },
      ];
      apiMock.getAll.mockReturnValue(of(threeHeroes));
      facade.loadAll().subscribe();

      facade.setPageSize(2);
      facade.setPageIndex(1);
      expect(facade.pageIndex()).toBe(1);

      apiMock.delete.mockReturnValue(of(undefined));
      facade.deleteHero('3').subscribe();

      expect(facade.heroes().length).toBe(2);
      expect(facade.pageIndex()).toBe(0);
    });
  });
});
