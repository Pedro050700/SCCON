import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BuscasApiService } from '../../../core/buscas-api.service';

export interface BuscaRealizada {
  id: string;
  cep: string;
  endereco: string;
  dataBusca: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BuscaHistoricoService {
  private api = inject(BuscasApiService);
  private historicoSubject = new BehaviorSubject<BuscaRealizada[]>([]);
  historico$ = this.historicoSubject.asObservable();

  constructor() {
    this.carregarHistorico();
  }

  private carregarHistorico(): void {
    this.api.listar().subscribe({
      next: buscas => this.historicoSubject.next(buscas),
      error: () => this.historicoSubject.next([])
    });
  }

  adicionarBusca(busca: Omit<BuscaRealizada, 'id'>): void {
    this.api.salvar(busca).pipe(
      tap(() => this.carregarHistorico())
    ).subscribe();
  }

  removerBusca(id: string): void {
    this.api.deletar(id).pipe(
      tap(() => {
        const atualizadas = this.historicoSubject.value.filter(b => b.id !== id);
        this.historicoSubject.next(atualizadas);
      })
    ).subscribe();
  }

  obterHistorico(): Observable<BuscaRealizada[]> {
    return this.historico$;
  }
}
