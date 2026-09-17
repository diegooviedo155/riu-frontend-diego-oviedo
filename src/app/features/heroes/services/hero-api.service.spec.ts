import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HeroApiService, HERO_API_SIMULATED_DELAY } from './hero-api.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';
import { HEROES_INITIAL_DATA } from '../data/heroes.data';

describe('HeroApiService', () => {
  let service: HeroApiService;
  let loadingServiceMock: {
    show: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    loadingServiceMock = {
      show: vi.fn(),
      hide: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HeroApiService,
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: HERO_API_SIMULATED_DELAY, useValue: 0 },
      ],
    });

    service = TestBed.inject(HeroApiService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Happy Path', () => {
    it('should retrieve all initial heroes seeded from HEROES_INITIAL_DATA', () => {
      let retrieved: Hero[] | undefined;

      service.getAll().subscribe((heroes) => {
        retrieved = heroes;
      });

      expect(retrieved).toEqual(HEROES_INITIAL_DATA);
      expect(retrieved?.length).toBe(20);
      expect(loadingServiceMock.show).toHaveBeenCalled();
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should fetch hero by id when it exists', () => {
      let retrieved: Hero | undefined;

      service.getById('1').subscribe((hero) => {
        retrieved = hero;
      });

      expect(retrieved?.name).toBe('SPIDERMAN');
      expect(loadingServiceMock.show).toHaveBeenCalled();
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should search heroes containing search term in name or alias', () => {
      let results: Hero[] | undefined;

      service.searchByName('man').subscribe((heroes) => {
        results = heroes;
      });

      expect(results).toBeDefined();
      expect(results!.length).toBeGreaterThan(0);
      expect(
        results!.every(
          (h) =>
            h.name.toLowerCase().includes('man') ||
            h.alias?.toLowerCase().includes('man'),
        ),
      ).toBe(true);
    });

    it('should return all heroes when search term is empty', () => {
      let results: Hero[] | undefined;

      service.searchByName('').subscribe((heroes) => {
        results = heroes;
      });

      expect(results?.length).toBe(20);
    });

    it('should create a new hero and assign the next sequential id', () => {
      const newHeroDto: HeroCreateDto = {
        name: 'FLASH',
        alias: 'Barry Allen',
        power: 'Super speed',
        publisher: 'DC',
      };

      let created: Hero | undefined;
      service.create(newHeroDto).subscribe((hero) => {
        created = hero;
      });

      expect(created?.id).toBe('21');
      expect(created?.name).toBe('FLASH');

      let allHeroes: Hero[] | undefined;
      service.getAll().subscribe((heroes) => {
        allHeroes = heroes;
      });
      expect(allHeroes?.length).toBe(21);
      expect(allHeroes?.some((h) => h.id === '21')).toBe(true);
    });

    it('should update an existing hero', () => {
      const updateDto: HeroUpdateDto = {
        name: 'PETER PARKER (SUPER)',
      };

      let updated: Hero | undefined;
      service.update('1', updateDto).subscribe((hero) => {
        updated = hero;
      });

      expect(updated?.id).toBe('1');
      expect(updated?.name).toBe('PETER PARKER (SUPER)');
      expect(updated?.alias).toBe('Peter Parker');
    });

    it('should delete a hero by id', () => {
      let deletionCompleted = false;
      service.delete('1').subscribe(() => {
        deletionCompleted = true;
      });

      expect(deletionCompleted).toBe(true);

      let allHeroes: Hero[] | undefined;
      service.getAll().subscribe((heroes) => {
        allHeroes = heroes;
      });
      expect(allHeroes?.some((h) => h.id === '1')).toBe(false);
      expect(allHeroes?.length).toBe(19);
    });
  });

  describe('Bad Path / Edge Cases', () => {
    it('should throw error when getById receives an invalid id', () => {
      let errorThrown: Error | undefined;

      service.getById('non-existent-id').subscribe({
        next: () => {},
        error: (err) => {
          errorThrown = err;
        },
      });

      expect(errorThrown).toBeDefined();
      expect(errorThrown?.message).toContain(
        'Hero with id non-existent-id not found',
      );
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should throw error when update receives an invalid id', () => {
      let errorThrown: Error | undefined;

      service.update('non-existent-id', { name: 'FAIL' }).subscribe({
        next: () => {},
        error: (err) => {
          errorThrown = err;
        },
      });

      expect(errorThrown).toBeDefined();
      expect(errorThrown?.message).toContain(
        'Hero with id non-existent-id not found',
      );
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should throw error when delete receives an invalid id', () => {
      let errorThrown: Error | undefined;

      service.delete('non-existent-id').subscribe({
        next: () => {},
        error: (err) => {
          errorThrown = err;
        },
      });

      expect(errorThrown).toBeDefined();
      expect(errorThrown?.message).toContain(
        'Hero with id non-existent-id not found',
      );
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should persist changes to localStorage and reload them', () => {
      const newHeroDto: HeroCreateDto = {
        name: 'AQUAMAN',
        alias: 'Arthur Curry',
        power: 'Water control',
        publisher: 'DC',
      };

      service.create(newHeroDto).subscribe();

      const storedJson = localStorage.getItem('riu_heroes_data');
      expect(storedJson).toBeDefined();
      expect(storedJson).toContain('AQUAMAN');
    });

    it('should support simulated delay on successful operation', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          HeroApiService,
          { provide: LoadingService, useValue: loadingServiceMock },
          { provide: HERO_API_SIMULATED_DELAY, useValue: 10 },
        ],
      });
      const delayedService = TestBed.inject(HeroApiService);
      const heroes = await firstValueFrom(delayedService.getAll());
      expect(heroes.length).toBe(20);
      expect(loadingServiceMock.show).toHaveBeenCalled();
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should support simulated delay on failing operation', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          HeroApiService,
          { provide: LoadingService, useValue: loadingServiceMock },
          { provide: HERO_API_SIMULATED_DELAY, useValue: 10 },
        ],
      });
      const delayedService = TestBed.inject(HeroApiService);
      await expect(
        firstValueFrom(delayedService.getById('non-existent-id')),
      ).rejects.toThrow();
      expect(loadingServiceMock.show).toHaveBeenCalled();
      expect(loadingServiceMock.hide).toHaveBeenCalled();
    });

    it('should fallback to HEROES_INITIAL_DATA when localStorage has invalid JSON', () => {
      localStorage.setItem('riu_heroes_data', 'invalid-json-string');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          HeroApiService,
          { provide: HERO_API_SIMULATED_DELAY, useValue: 0 },
        ],
      });
      const localService = TestBed.inject(HeroApiService);
      let heroes: Hero[] = [];
      localService.getAll().subscribe((data) => (heroes = data));
      expect(heroes.length).toBe(20);
    });

    it('should fallback to HEROES_INITIAL_DATA when localStorage has empty array', () => {
      localStorage.setItem('riu_heroes_data', '[]');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          HeroApiService,
          { provide: HERO_API_SIMULATED_DELAY, useValue: 0 },
        ],
      });
      const localService = TestBed.inject(HeroApiService);
      let heroes: Hero[] = [];
      localService.getAll().subscribe((data) => (heroes = data));
      expect(heroes.length).toBe(20);
    });

    it('should gracefully handle localStorage.setItem exceptions', () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceeded');
        });
      expect(() => {
        service
          .create({ name: 'TEST', alias: 'Test', power: 'None' })
          .subscribe();
      }).not.toThrow();
      setItemSpy.mockRestore();
    });

    it('should execute successfully when LoadingService is not provided', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          HeroApiService,
          { provide: HERO_API_SIMULATED_DELAY, useValue: 0 },
        ],
      });
      const serviceWithoutLoading = TestBed.inject(HeroApiService);
      let heroes: Hero[] = [];
      serviceWithoutLoading.getAll().subscribe((data) => (heroes = data));
      expect(heroes.length).toBe(20);
    });
  });
});
