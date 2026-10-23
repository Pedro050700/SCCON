import { animate, style, transition, trigger } from '@angular/animations';
import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BuscaHistoricoService, BuscaRealizada } from '../../services/busca-historico.service';

interface BuscaRealizadaView extends BuscaRealizada {
  dataFormatada: string;
}

@Component({
  selector: 'sccon-listagem-buscas',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './listagem.component.html',
  styleUrl: './listagem.component.scss',
  animations: [
    trigger('linhaAnimada', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Listagem {
  private readonly historicoService = inject(BuscaHistoricoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly FORMATO_HORA: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  readonly colunas: string[] = ['cep', 'endereco', 'dataBusca', 'acao'];
  readonly dataSource = new MatTableDataSource<BuscaRealizadaView>();
  readonly pageSize = 5;

  private readonly totalBuscas = signal(0);
  readonly temBuscas = computed(() => this.totalBuscas() > 0);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) this.dataSource.paginator = p;
  }

  constructor() {
    this.configurarHistorico();
  }

  private configurarHistorico(): void {
    this.historicoService.obterHistorico()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(buscas => {
        this.dataSource.data = buscas.map(b => this.paraBuscaView(b));
        this.totalBuscas.set(buscas.length);
      });
  }

  private paraBuscaView(busca: BuscaRealizada): BuscaRealizadaView {
    const d = new Date(busca.dataBusca);
    const dia = d.toLocaleDateString('pt-BR');
    const hora = d.toLocaleTimeString('pt-BR', this.FORMATO_HORA);
    return { ...busca, dataFormatada: `${dia} - ${hora}` };
  }

  deletarBusca(id: string): void {
    this.historicoService.removerBusca(id);
  }
}

