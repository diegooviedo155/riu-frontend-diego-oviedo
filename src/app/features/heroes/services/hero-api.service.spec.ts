import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroApiService } from './hero-api.service';
import { BaseApiService } from '../../../core/http/base-api.service';
import { HEROES_API_URL } from '../../../core/tokens/api.token';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';

describe('HeroApiService', () => {
  let service: HeroApiService;
  let baseApiMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  const mockApiUrl = 'http://test-api.com/heroes';

  const mockHeroes: Hero[] = [
    {
      id: '1',
      name: 'SPIDERMAN',
      alias: 'Peter Parker',
      power: 'Spider-Sense',
    },
    {
      id: '2',
      name: 'SUPERMAN',
      alias: 'Clark Kent',
      power: 'Flight',
    },
  ];

  beforeEach(() => {
    baseApiMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HeroApiService,
        { provide: BaseApiService, useValue: baseApiMock },
        { provide: HEROES_API_URL, useValue: mockApiUrl },
      ],
    });

    service = TestBed.inject(HeroApiService);
  });

  describe('Happy Path', () => {
    it('should retrieve all heroes via baseApi.get', () => {
      baseApiMock.get.mockReturnValue(of(mockHeroes));
      let retrievedHeroes: Hero[] | undefined;

      service.getAll().subscribe((heroes) => {
        retrievedHeroes = heroes;
      });

      expect(baseApiMock.get).toHaveBeenCalledWith(mockApiUrl);
      expect(retrievedHeroes).toEqual(mockHeroes);
    });

    it('should fetch hero by id via baseApi.get', () => {
      baseApiMock.get.mockReturnValue(of(mockHeroes[0]));
      let retrievedHero: Hero | undefined;

      service.getById('1').subscribe((hero) => {
        retrievedHero = hero;
      });

      expect(baseApiMock.get).toHaveBeenCalledWith(`${mockApiUrl}/1`);
      expect(retrievedHero).toEqual(mockHeroes[0]);
    });

    it('should search heroes by name setting name_like param', () => {
      baseApiMock.get.mockReturnValue(of(mockHeroes));
      let retrievedHeroes: Hero[] | undefined;

      service.searchByName('man').subscribe((heroes) => {
        retrievedHeroes = heroes;
      });

      expect(baseApiMock.get).toHaveBeenCalledWith(
        mockApiUrl,
        expect.any(HttpParams),
      );
      const passedParams = baseApiMock.get.mock.calls[0][1] as HttpParams;
      expect(passedParams.get('name_like')).toBe('man');
      expect(retrievedHeroes).toEqual(mockHeroes);
    });

    it('should create new hero via baseApi.post', () => {
      const payload: HeroCreateDto = {
        name: 'BATMAN',
        alias: 'Bruce Wayne',
        power: 'Intellect',
      };
      const createdHero: Hero = { id: '3', ...payload };
      baseApiMock.post.mockReturnValue(of(createdHero));
      let result: Hero | undefined;

      service.create(payload).subscribe((hero) => {
        result = hero;
      });

      expect(baseApiMock.post).toHaveBeenCalledWith(mockApiUrl, payload);
      expect(result).toEqual(createdHero);
    });

    it('should update hero via baseApi.put', () => {
      const updateDto: HeroUpdateDto = { alias: 'Miles Morales' };
      const updatedHero: Hero = { ...mockHeroes[0], alias: 'Miles Morales' };
      baseApiMock.put.mockReturnValue(of(updatedHero));
      let result: Hero | undefined;

      service.update('1', updateDto).subscribe((hero) => {
        result = hero;
      });

      expect(baseApiMock.put).toHaveBeenCalledWith(
        `${mockApiUrl}/1`,
        updateDto,
      );
      expect(result).toEqual(updatedHero);
    });

    it('should delete hero by id via baseApi.delete', () => {
      baseApiMock.delete.mockReturnValue(of(undefined));
      let completed = false;

      service.delete('1').subscribe(() => {
        completed = true;
      });

      expect(baseApiMock.delete).toHaveBeenCalledWith(`${mockApiUrl}/1`);
      expect(completed).toBe(true);
    });
  });

  describe('Bad Path', () => {
    it('should propagate error when baseApi.get fails with 404', () => {
      const errorObj = new Error('Hero not found');
      baseApiMock.get.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      service.getById('999').subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      expect(capturedError).toBe(errorObj);
    });

    it('should propagate error when baseApi.post fails with 500', () => {
      const errorObj = new Error('Server error');
      baseApiMock.post.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      service.create({ name: 'A', alias: 'B', power: 'C' }).subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      expect(capturedError).toBe(errorObj);
    });

    it('should propagate error when baseApi.delete fails', () => {
      const errorObj = new Error('Delete failure');
      baseApiMock.delete.mockReturnValue(throwError(() => errorObj));
      let capturedError: Error | undefined;

      service.delete('1').subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      expect(capturedError).toBe(errorObj);
    });
  });

  describe('Border Cases', () => {
    it('should pass empty string param when search term is empty', () => {
      baseApiMock.get.mockReturnValue(of([]));

      service.searchByName('').subscribe();

      const passedParams = baseApiMock.get.mock.calls[0][1] as HttpParams;
      expect(passedParams.get('name_like')).toBe('');
    });

    it('should handle hero without optional properties during creation', () => {
      const payload: HeroCreateDto = {
        name: 'FLASH',
        alias: 'Barry Allen',
        power: 'Super Speed',
      };
      const createdHero: Hero = { id: '4', ...payload };
      baseApiMock.post.mockReturnValue(of(createdHero));
      let result: Hero | undefined;

      service.create(payload).subscribe((hero) => {
        result = hero;
      });

      expect(result?.description).toBeUndefined();
      expect(result?.publisher).toBeUndefined();
    });
  });
});
