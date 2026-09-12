import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BaseApiService } from './base-api.service';

describe('BaseApiService', () => {
  let service: BaseApiService;
  let httpMock: HttpTestingController;
  const testUrl = '/api/resource';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BaseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Happy Path', () => {
    it('should perform GET request and return typed data', () => {
      interface MockData {
        id: number;
        name: string;
      }
      const mockResponse: MockData = { id: 1, name: 'Item 1' };
      let result: MockData | undefined;

      service.get<MockData>(testUrl).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should perform GET request with query params', () => {
      const params = new HttpParams().set('search', 'query');
      let result: string[] | undefined;

      service.get<string[]>(testUrl, params).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(`${testUrl}?search=query`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('query');
      req.flush(['one', 'two']);

      expect(result).toEqual(['one', 'two']);
    });

    it('should perform POST request and return created entity', () => {
      const payload = { name: 'New Item' };
      const mockCreated = { id: 10, name: 'New Item' };
      let result: typeof mockCreated | undefined;

      service
        .post<typeof mockCreated, typeof payload>(testUrl, payload)
        .subscribe((data) => {
          result = data;
        });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockCreated);

      expect(result).toEqual(mockCreated);
    });

    it('should perform PUT request and return updated entity', () => {
      const payload = { name: 'Updated Item' };
      const mockUpdated = { id: 10, name: 'Updated Item' };
      let result: typeof mockUpdated | undefined;

      service
        .put<typeof mockUpdated, typeof payload>(`${testUrl}/10`, payload)
        .subscribe((data) => {
          result = data;
        });

      const req = httpMock.expectOne(`${testUrl}/10`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(mockUpdated);

      expect(result).toEqual(mockUpdated);
    });

    it('should perform DELETE request and complete successfully', () => {
      let completed = false;

      service.delete<void>(`${testUrl}/10`).subscribe(() => {
        completed = true;
      });

      const req = httpMock.expectOne(`${testUrl}/10`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(completed).toBe(true);
    });
  });

  describe('Bad Path', () => {
    it('should handle 404 Not Found error and transform into Error observable', () => {
      let capturedError: Error | undefined;

      service.get<unknown>(`${testUrl}/missing`).subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      const req = httpMock.expectOne(`${testUrl}/missing`);
      req.flush('Resource not found', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError?.message).toBeTruthy();
    });

    it('should handle 500 Internal Server Error and transform into Error observable', () => {
      let capturedError: Error | undefined;

      service.post<unknown, unknown>(testUrl, {}).subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush('Server crashed', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError?.message).toBeTruthy();
    });

    it('should handle client-side network failure event', () => {
      let capturedError: Error | undefined;

      service.delete<void>(`${testUrl}/1`).subscribe({
        error: (err: Error) => {
          capturedError = err;
        },
      });

      const req = httpMock.expectOne(`${testUrl}/1`);
      req.error(new ProgressEvent('Network error'));

      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError?.message).toBeTruthy();
    });
  });

  describe('Border Cases', () => {
    it('should handle GET request without HttpParams gracefully', () => {
      let result: string[] | undefined;

      service.get<string[]>(testUrl, undefined).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(testUrl);
      req.flush([]);

      expect(result).toEqual([]);
    });

    it('should handle response with null body', () => {
      let result: unknown = 'initial';

      service.get<unknown>(testUrl).subscribe((data) => {
        result = data;
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null);

      expect(result).toBeNull();
    });
  });
});
