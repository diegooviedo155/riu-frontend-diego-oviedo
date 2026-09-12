import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { HEROES_API_URL } from './api.token';
import { environment } from '../../../environments/environment';

describe('HEROES_API_URL', () => {
  describe('Happy Path', () => {
    it('should provide default environment api url from token factory', () => {
      const url = TestBed.inject(HEROES_API_URL);

      expect(url).toBe(`${environment.apiUrl}/heroes`);
    });
  });
});
