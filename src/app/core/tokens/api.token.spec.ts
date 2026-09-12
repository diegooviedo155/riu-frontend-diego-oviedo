import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { HEROES_API_URL } from './api.token';

describe('HEROES_API_URL', () => {
  describe('Happy Path', () => {
    it('should provide default localhost url from token factory', () => {
      const url = TestBed.inject(HEROES_API_URL);

      expect(url).toBe('http://localhost:3000/heroes');
    });
  });
});
