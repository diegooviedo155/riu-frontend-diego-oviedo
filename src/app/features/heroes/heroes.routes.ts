import { Routes } from '@angular/router';

export const HEROES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/hero-list/hero-list.component').then(
        (m) => m.HeroListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent,
      ),
  },
];
