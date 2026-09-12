import { InjectionToken } from '@angular/core';

export const HEROES_API_URL = new InjectionToken<string>('HEROES_API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/heroes',
});
