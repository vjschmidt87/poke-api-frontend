import { Routes } from '@angular/router';

export const CONTESTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contests-page.component').then(m => m.ContestsPageComponent),
  },
  {
    path: 'type/:name',
    loadComponent: () =>
      import('./contest-type-detail.component').then(m => m.ContestTypeDetailComponent),
  },
  {
    path: 'effect/:id',
    loadComponent: () =>
      import('./contest-effect-detail.component').then(m => m.ContestEffectDetailComponent),
  },
  {
    path: 'super-effect/:id',
    loadComponent: () =>
      import('./super-contest-effect-detail.component').then(m => m.SuperContestEffectDetailComponent),
  },
];
