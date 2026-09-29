import { Routes } from '@angular/router';

export const LOCATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./locations-page.component').then(m => m.LocationsPageComponent),
  },
  {
    path: 'location/:name',
    loadComponent: () =>
      import('./location-detail.component').then(m => m.LocationDetailComponent),
  },
  {
    path: 'location-area/:name',
    loadComponent: () =>
      import('./location-area-detail.component').then(m => m.LocationAreaDetailComponent),
  },
  {
    path: 'pal-park-area/:name',
    loadComponent: () =>
      import('./pal-park-area-detail.component').then(m => m.PalParkAreaDetailComponent),
  },
  {
    path: 'region/:name',
    loadComponent: () =>
      import('./region-detail.component').then(m => m.RegionDetailComponent),
  },
];
