import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const HEROES_API_URL = new InjectionToken<string>('HEROES_API_URL', {
  providedIn: 'root',
  factory: () => `${environment.apiUrl}/heroes`,
});
