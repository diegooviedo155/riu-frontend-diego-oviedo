import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Happy Path', () => {
    it('should show loading on request initiation and hide upon success', () => {
      const showSpy = vi.spyOn(loadingService, 'show');
      const hideSpy = vi.spyOn(loadingService, 'hide');

      httpClient.get('/test-api').subscribe();

      expect(showSpy).toHaveBeenCalledTimes(1);
      expect(hideSpy).not.toHaveBeenCalled();

      const req = httpTestingController.expectOne('/test-api');
      req.flush({ data: 'ok' });

      expect(hideSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bad Path', () => {
    it('should show loading on request and hide upon HTTP 500 error response', () => {
      const showSpy = vi.spyOn(loadingService, 'show');
      const hideSpy = vi.spyOn(loadingService, 'hide');

      httpClient.get('/test-api-error').subscribe({
        error: () => {},
      });

      expect(showSpy).toHaveBeenCalledTimes(1);
      expect(hideSpy).not.toHaveBeenCalled();

      const req = httpTestingController.expectOne('/test-api-error');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(hideSpy).toHaveBeenCalledTimes(1);
    });

    it('should show loading on request and hide upon network failure event', () => {
      const showSpy = vi.spyOn(loadingService, 'show');
      const hideSpy = vi.spyOn(loadingService, 'hide');

      httpClient.get('/test-network-error').subscribe({
        error: () => {},
      });

      expect(showSpy).toHaveBeenCalledTimes(1);
      expect(hideSpy).not.toHaveBeenCalled();

      const req = httpTestingController.expectOne('/test-network-error');
      req.error(new ProgressEvent('Network error'));

      expect(hideSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Border Cases', () => {
    it('should coordinate loading state across multiple concurrent requests', () => {
      const showSpy = vi.spyOn(loadingService, 'show');
      const hideSpy = vi.spyOn(loadingService, 'hide');

      httpClient.get('/api-1').subscribe();
      httpClient.get('/api-2').subscribe();

      expect(showSpy).toHaveBeenCalledTimes(2);
      expect(hideSpy).not.toHaveBeenCalled();

      const req1 = httpTestingController.expectOne('/api-1');
      const req2 = httpTestingController.expectOne('/api-2');

      req1.flush({});
      expect(hideSpy).toHaveBeenCalledTimes(1);

      req2.flush({});
      expect(hideSpy).toHaveBeenCalledTimes(2);
    });
  });
});
