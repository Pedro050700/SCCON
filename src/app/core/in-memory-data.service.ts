import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    return {
      buscas: []
    };
  }

  // Garante que o ID gerado seja único ao fazer POST
  genId(buscas: { id: number }[]): number {
    return buscas.length > 0
      ? Math.max(...buscas.map(b => b.id)) + 1
      : 1;
  }
}
