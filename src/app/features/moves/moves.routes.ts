import { Routes } from '@angular/router';

export const MOVES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./moves-page.component').then(m => m.MovesPageComponent),
  },
  {
    path: 'move/:name',
    loadComponent: () =>
      import('./move-detail.component').then(m => m.MoveDetailComponent),
  },
  {
    path: 'ailment/:name',
    loadComponent: () =>
      import('./ailment-detail.component').then(m => m.AilmentDetailComponent),
  },
  {
    path: 'damage-class/:name',
    loadComponent: () =>
      import('./damage-class-detail.component').then(m => m.DamageClassDetailComponent),
  },
  {
    path: 'category/:name',
    loadComponent: () =>
      import('./category-detail.component').then(m => m.CategoryDetailComponent),
  },
  {
    path: 'learn-method/:name',
    loadComponent: () =>
      import('./learn-method-detail.component').then(m => m.LearnMethodDetailComponent),
  },
  {
    path: 'target/:name',
    loadComponent: () =>
      import('./target-detail.component').then(m => m.TargetDetailComponent),
  },
  {
    path: 'battle-style/:name',
    loadComponent: () =>
      import('./battle-style-detail.component').then(m => m.BattleStyleDetailComponent),
  },
];
