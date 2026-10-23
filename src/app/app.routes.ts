import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    // Carrega as rotas da funcionalidade Home somente quando o usuário acessa /home.
    loadChildren: () => import('./modules/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'cep',
    // A funcionalidade de Endereços é carregada separadamente da Home.
    loadChildren: () => import('./modules/cep/cep.routes').then(m => m.cepRoutes)
  },
  {
    path: 'webgis',
    loadChildren: () => import('./modules/webgis/webgis.routes').then(m => m.WEBGIS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
