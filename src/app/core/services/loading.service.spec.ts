import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  describe('Happy Path', () => {
    it('should be created and functional', () => {
      expect(service).toBeTruthy();
    });

    it('should update isLoading to true when show is invoked', () => {
      service.show();

      expect(service.isLoading()).toBe(true);
    });

    it('should update isLoading to false when hide is invoked after show', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Bad Path', () => {
    it('should prevent active requests counter from falling below zero on unexpected hide', () => {
      service.hide();
      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should stay false when hide is called repeatedly while not loading', () => {
      service.hide();
      service.hide();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Border Cases', () => {
    it('should initialize with isLoading false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should accurately track multiple concurrent show and hide calls', () => {
      service.show();
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });
});
