import { Routes } from '@angular/router';

export const ENCOUNTERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./encounters-page.component').then(m => m.EncountersPageComponent),
  },
  {
    path: 'method/:name',
    loadComponent: () =>
      import('./method-detail.component').then(m => m.MethodDetailComponent),
  },
  {
    path: 'condition/:name',
    loadComponent: () =>
      import('./condition-detail.component').then(m => m.ConditionDetailComponent),
  },
  {
    path: 'condition-value/:name',
    loadComponent: () =>
      import('./condition-value-detail.component').then(m => m.ConditionValueDetailComponent),
  },
];
