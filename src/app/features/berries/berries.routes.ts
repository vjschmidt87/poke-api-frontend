import { Routes } from '@angular/router';

export const BERRIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./berries-page.component').then(m => m.BerriesPageComponent),
  },
  {
    path: 'berry/:name',
    loadComponent: () =>
      import('./berry-detail.component').then(m => m.BerryDetailComponent),
  },
  {
    path: 'firmness/:name',
    loadComponent: () =>
      import('./firmness-detail.component').then(m => m.FirmnessDetailComponent),
  },
  {
    path: 'flavor/:name',
    loadComponent: () =>
      import('./flavor-detail.component').then(m => m.FlavorDetailComponent),
  },
];
