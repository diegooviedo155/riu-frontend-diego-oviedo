import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/http/base-api.service';
import { HEROES_API_URL } from '../../../core/tokens/api.token';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class HeroApiService {
  private readonly baseApi = inject(BaseApiService);
  private readonly apiUrl = inject(HEROES_API_URL);

  getAll(): Observable<Hero[]> {
    return this.baseApi.get<Hero[]>(this.apiUrl);
  }

  getById(id: string): Observable<Hero> {
    return this.baseApi.get<Hero>(`${this.apiUrl}/${id}`);
  }

  searchByName(term: string): Observable<Hero[]> {
    const params = new HttpParams().set('name_like', term);
    return this.baseApi.get<Hero[]>(this.apiUrl, params);
  }

  create(hero: HeroCreateDto): Observable<Hero> {
    return this.baseApi.post<Hero, HeroCreateDto>(this.apiUrl, hero);
  }

  update(id: string, hero: HeroUpdateDto): Observable<Hero> {
    return this.baseApi.put<Hero, HeroUpdateDto>(`${this.apiUrl}/${id}`, hero);
  }

  delete(id: string): Observable<void> {
    return this.baseApi.delete<void>(`${this.apiUrl}/${id}`);
  }
}
