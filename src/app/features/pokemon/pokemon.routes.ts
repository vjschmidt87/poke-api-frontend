import { Routes } from '@angular/router';

export const POKEMON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pokemon-page.component').then(m => m.PokemonPageComponent),
  },
  {
    path: 'pokemon/:name',
    loadComponent: () =>
      import('./pokemon-detail.component').then(m => m.PokemonDetailComponent),
  },
  {
    path: 'ability/:name',
    loadComponent: () =>
      import('./ability-detail.component').then(m => m.AbilityDetailComponent),
  },
  {
    path: 'type/:name',
    loadComponent: () =>
      import('./type-detail.component').then(m => m.TypeDetailComponent),
  },
  {
    path: 'species/:name',
    loadComponent: () =>
      import('./species-detail.component').then(m => m.SpeciesDetailComponent),
  },
  {
    path: 'nature/:name',
    loadComponent: () =>
      import('./nature-detail.component').then(m => m.NatureDetailComponent),
  },
  {
    path: 'egg-group/:name',
    data: { endpoint: 'egg-group', title: 'Egg Group' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'stat/:name',
    data: { endpoint: 'stat', title: 'Stat' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'growth-rate/:name',
    data: { endpoint: 'growth-rate', title: 'Growth Rate' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'color/:name',
    data: { endpoint: 'pokemon-color', title: 'Color' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'shape/:name',
    data: { endpoint: 'pokemon-shape', title: 'Shape' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'habitat/:name',
    data: { endpoint: 'pokemon-habitat', title: 'Habitat' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'gender/:name',
    data: { endpoint: 'gender', title: 'Gender' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'pokemon-form/:name',
    data: { endpoint: 'pokemon-form', title: 'Pokemon Form' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'characteristic/:name',
    data: { endpoint: 'characteristic', title: 'Characteristic' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  {
    path: 'pokeathlon-stat/:name',
    data: { endpoint: 'pokeathlon-stat', title: 'Pokeathlon Stat' },
    loadComponent: () =>
      import('./resource-detail.component').then(m => m.ResourceDetailComponent),
  },
];
