import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(url, { params }).pipe(catchError(this.handleError));
  }

  post<T, B>(url: string, body: B): Observable<T> {
    return this.http.post<T>(url, body).pipe(catchError(this.handleError));
  }

  put<T, B>(url: string, body: B): Observable<T> {
    return this.http.put<T>(url, body).pipe(catchError(this.handleError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(catchError(this.handleError));
  }

  private readonly handleError = (
    error: HttpErrorResponse,
  ): Observable<never> => {
    return throwError(() => new Error(error.message));
  };
}
