import { Routes } from '@angular/router';

export const EVOLUTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./evolution-page.component').then(m => m.EvolutionPageComponent),
  },
  {
    path: 'chain/:id',
    loadComponent: () =>
      import('./chain-detail.component').then(m => m.ChainDetailComponent),
  },
  {
    path: 'trigger/:name',
    loadComponent: () =>
      import('./trigger-detail.component').then(m => m.TriggerDetailComponent),
  },
];
