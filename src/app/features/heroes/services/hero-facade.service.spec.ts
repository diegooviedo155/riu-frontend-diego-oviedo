import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroFacadeService } from './hero-facade.service';
import { HeroApiService } from './hero-api.service';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';

describe('HeroFacadeService', () => {
  let facade: HeroFacadeService;
  let apiMock: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
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

    it('should delegate getHeroById to api service', () => {
      apiMock.getById.mockReturnValue(of(mockHeroes[0]));
      let result: Hero | undefined;

      facade.getHeroById('1').subscribe((hero) => {
        result = hero;
      });

      expect(apiMock.getById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockHeroes[0]);
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
    it('should initialize with empty signals', () => {
      expect(facade.heroes()).toEqual([]);
      expect(facade.searchTerm()).toBe('');
      expect(facade.filteredHeroes()).toEqual([]);
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
  });
});
