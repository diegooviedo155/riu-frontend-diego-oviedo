import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';
import { HERO_PAGINATION_CONFIG } from '../constants/hero.constants';
import { HeroApiService } from './hero-api.service';

@Injectable({
  providedIn: 'root',
})
export class HeroFacadeService {
  private readonly api = inject(HeroApiService);

  private readonly _heroes = signal<Hero[]>([]);
  private readonly _searchTerm = signal<string>('');
  private readonly _pageIndex = signal<number>(0);
  private readonly _pageSize = signal<number>(
    HERO_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  );

  readonly heroes = this._heroes.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly pageIndex = this._pageIndex.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  readonly filteredHeroes = computed(() => {
    const term = this._searchTerm().trim().toLowerCase();
    if (!term) return this._heroes();
    return this._heroes().filter((hero) =>
      hero.name.toLowerCase().includes(term),
    );
  });

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._pageIndex.set(0);
  }

  setPageIndex(index: number): void {
    this._pageIndex.set(index);
  }

  setPageSize(size: number): void {
    this._pageSize.set(size);
  }

  loadAll(): Observable<Hero[]> {
    return this.api.getAll().pipe(tap((heroes) => this._heroes.set(heroes)));
  }

  getHeroById(id: string): Observable<Hero> {
    return this.api.getById(id);
  }

  createHero(dto: HeroCreateDto): Observable<Hero> {
    return this.api
      .create(dto)
      .pipe(
        tap((created) => this._heroes.update((items) => [...items, created])),
      );
  }

  updateHero(id: string, dto: HeroUpdateDto): Observable<Hero> {
    return this.api.update(id, dto).pipe(
      tap((updated) => {
        this._heroes.update((items) =>
          items.map((item) => (item.id === id ? updated : item)),
        );
      }),
    );
  }

  deleteHero(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this._heroes.update((items) => items.filter((item) => item.id !== id));
      }),
    );
  }
}
