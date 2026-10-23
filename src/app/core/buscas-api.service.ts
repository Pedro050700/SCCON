import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuscaRealizada } from '../modules/cep/services/busca-historico.service';

@Injectable({
  providedIn: 'root'
})
export class BuscasApiService {
  private apiUrl = 'api/buscas';
  private http = inject(HttpClient);

  listar(): Observable<BuscaRealizada[]> {
    return this.http.get<BuscaRealizada[]>(this.apiUrl);
  }

  salvar(busca: Omit<BuscaRealizada, 'id'>): Observable<BuscaRealizada> {
    return this.http.post<BuscaRealizada>(this.apiUrl, busca);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
