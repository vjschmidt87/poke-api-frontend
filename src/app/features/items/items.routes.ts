import { Routes } from '@angular/router';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./items-page.component').then(m => m.ItemsPageComponent),
  },
  {
    path: 'item/:name',
    loadComponent: () =>
      import('./item-detail.component').then(m => m.ItemDetailComponent),
  },
  {
    path: 'attribute/:name',
    loadComponent: () =>
      import('./attribute-detail.component').then(m => m.AttributeDetailComponent),
  },
  {
    path: 'category/:name',
    loadComponent: () =>
      import('./category-detail.component').then(m => m.CategoryDetailComponent),
  },
  {
    path: 'fling-effect/:id',
    loadComponent: () =>
      import('./fling-effect-detail.component').then(m => m.FlingEffectDetailComponent),
  },
  {
    path: 'pocket/:name',
    loadComponent: () =>
      import('./pocket-detail.component').then(m => m.PocketDetailComponent),
  },
];
