import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, defer, of, throwError, timer } from 'rxjs';
import { delay, finalize, switchMap } from 'rxjs/operators';
import { LoadingService } from '../../../core/services/loading.service';
import { Hero, HeroCreateDto, HeroUpdateDto } from '../models';
import { HEROES_INITIAL_DATA } from '../data/heroes.data';
import { normalizeHeroText } from '../utils/hero.utils';

export const HERO_API_SIMULATED_DELAY = new InjectionToken<number>(
  'HERO_API_SIMULATED_DELAY',
  {
    providedIn: 'root',
    factory: () => 150,
  },
);

@Injectable({
  providedIn: 'root',
})
export class HeroApiService {
  private readonly loadingService = inject(LoadingService, { optional: true });
  private readonly simulatedDelay =
    inject(HERO_API_SIMULATED_DELAY, { optional: true }) ?? 150;
  private readonly storageKey = 'riu_heroes_data';

  private heroes: Hero[] = this.loadInitialData();

  getAll(): Observable<Hero[]> {
    return this.simulateOperation(() => [...this.heroes]);
  }

  searchByName(term: string): Observable<Hero[]> {
    return this.simulateOperation(() => {
      const normalized = normalizeHeroText(term);
      if (!normalized) {
        return [...this.heroes];
      }
      return this.heroes.filter(
        (hero) =>
          normalizeHeroText(hero.name).includes(normalized) ||
          normalizeHeroText(hero.alias).includes(normalized),
      );
    });
  }

  getById(id: string): Observable<Hero> {
    return this.simulateOperation(() => {
      const hero = this.heroes.find((h) => h.id === id);
      if (!hero) {
        throw new Error(`Hero with id ${id} not found`);
      }
      return { ...hero };
    });
  }

  create(hero: HeroCreateDto): Observable<Hero> {
    return this.simulateOperation(() => {
      const numericIds = this.heroes
        .map((h) => parseInt(h.id, 10))
        .filter((num) => !isNaN(num));
      const nextId = String(
        numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1,
      );
      const createdHero: Hero = {
        id: nextId,
        ...hero,
      };
      this.heroes = [...this.heroes, createdHero];
      this.persist();
      return createdHero;
    });
  }

  update(id: string, hero: HeroUpdateDto): Observable<Hero> {
    return this.simulateOperation(() => {
      const index = this.heroes.findIndex((h) => h.id === id);
      if (index === -1) {
        throw new Error(`Hero with id ${id} not found`);
      }
      const updatedHero: Hero = {
        ...this.heroes[index],
        ...hero,
      };
      this.heroes[index] = updatedHero;
      this.persist();
      return updatedHero;
    });
  }

  delete(id: string): Observable<void> {
    return this.simulateOperation(() => {
      const exists = this.heroes.some((h) => h.id === id);
      if (!exists) {
        throw new Error(`Hero with id ${id} not found`);
      }
      this.heroes = this.heroes.filter((h) => h.id !== id);
      this.persist();
      return undefined;
    });
  }

  private loadInitialData(): Hero[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [...HEROES_INITIAL_DATA];
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.heroes),
        );
      } catch {}
    }
  }

  private simulateOperation<T>(operation: () => T): Observable<T> {
    return defer(() => {
      this.loadingService?.show();
      let result: T;
      let syncError: unknown = null;

      try {
        result = operation();
      } catch (err) {
        syncError = err;
      }

      if (syncError) {
        if (this.simulatedDelay > 0) {
          return timer(this.simulatedDelay).pipe(
            switchMap(() => throwError(() => syncError)),
            finalize(() => this.loadingService?.hide()),
          );
        }
        return throwError(() => syncError).pipe(
          finalize(() => this.loadingService?.hide()),
        );
      }

      if (this.simulatedDelay > 0) {
        return of(result!).pipe(
          delay(this.simulatedDelay),
          finalize(() => this.loadingService?.hide()),
        );
      }
      return of(result!).pipe(finalize(() => this.loadingService?.hide()));
    });
  }
}
