import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'pokemon',
        loadChildren: () => import('./features/pokemon/pokemon.routes').then(m => m.POKEMON_ROUTES),
      },
      {
        path: 'moves',
        loadChildren: () => import('./features/moves/moves.routes').then(m => m.MOVES_ROUTES),
      },
      {
        path: 'items',
        loadChildren: () => import('./features/items/items.routes').then(m => m.ITEMS_ROUTES),
      },
      {
        path: 'berries',
        loadChildren: () => import('./features/berries/berries.routes').then(m => m.BERRIES_ROUTES),
      },
      {
        path: 'evolution',
        loadChildren: () => import('./features/evolution/evolution.routes').then(m => m.EVOLUTION_ROUTES),
      },
      {
        path: 'games',
        loadChildren: () => import('./features/games/games.routes').then(m => m.GAMES_ROUTES),
      },
      {
        path: 'locations',
        loadChildren: () => import('./features/locations/locations.routes').then(m => m.LOCATIONS_ROUTES),
      },
      {
        path: 'contests',
        loadChildren: () => import('./features/contests/contests.routes').then(m => m.CONTESTS_ROUTES),
      },
      {
        path: 'encounters',
        loadChildren: () => import('./features/encounters/encounters.routes').then(m => m.ENCOUNTERS_ROUTES),
      },
      {
        path: 'machines',
        loadChildren: () => import('./features/machines/machines.routes').then(m => m.MACHINES_ROUTES),
      },
    ],
  },
];
