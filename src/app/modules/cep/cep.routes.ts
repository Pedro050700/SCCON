import { Routes } from '@angular/router';

export const cepRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/busca/busca.component').then(m => m.Busca)
  }
];
