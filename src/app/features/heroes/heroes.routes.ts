import { Routes } from '@angular/router';

export const HEROES_ROUTES: Routes = [
  {
    path: '',
    title: 'Gestión de Héroes | RIU',
    loadComponent: () =>
      import('./pages/hero-list/hero-list.component').then(
        (m) => m.HeroListComponent,
      ),
  },
  {
    path: 'new',
    title: 'Nuevo Héroe | RIU',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent,
      ),
  },
  {
    path: 'edit/:id',
    title: 'Editar Héroe | RIU',
    loadComponent: () =>
      import('./pages/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent,
      ),
  },
];
