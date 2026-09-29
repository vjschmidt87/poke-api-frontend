import { Routes } from '@angular/router';

export const MACHINES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./machines-page.component').then(m => m.MachinesPageComponent),
  },
  {
    path: 'machine/:id',
    loadComponent: () =>
      import('./machine-detail.component').then(m => m.MachineDetailComponent),
  },
];
