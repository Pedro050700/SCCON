import { Routes } from '@angular/router';

export const WEBGIS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/mapa/mapa.component').then(m => m.Mapa),
  },
];
