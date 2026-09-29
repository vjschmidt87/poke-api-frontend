import { Routes } from '@angular/router';

export const GAMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./games-page.component').then(m => m.GamesPageComponent),
  },
  {
    path: 'generation/:name',
    loadComponent: () =>
      import('./generation-detail.component').then(m => m.GenerationDetailComponent),
  },
  {
    path: 'pokedex/:name',
    loadComponent: () =>
      import('./pokedex-detail.component').then(m => m.PokedexDetailComponent),
  },
  {
    path: 'version/:name',
    loadComponent: () =>
      import('./version-detail.component').then(m => m.VersionDetailComponent),
  },
  {
    path: 'version-group/:name',
    loadComponent: () =>
      import('./version-group-detail.component').then(m => m.VersionGroupDetailComponent),
  },
];
