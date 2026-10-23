import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { InMemoryDataService } from './core/in-memory-data.service';
import { PaginatorPtBr } from './core/paginator-pt-br';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxMask(),
    { provide: MatPaginatorIntl, useClass: PaginatorPtBr },
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        delay: 300
      })
    )
  ]
};
