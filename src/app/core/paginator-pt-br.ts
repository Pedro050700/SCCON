import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginatorPtBr extends MatPaginatorIntl {
  private readonly LABELS = {
    primeira: 'Primeira página',
    ultima: 'Última página',
    proxima: 'Próxima página',
    anterior: 'Página anterior',
    itensPorPagina: 'Itens por página:',
    nenhumResultado: 'Nenhum resultado',
  } as const;

  override firstPageLabel = this.LABELS.primeira;
  override lastPageLabel = this.LABELS.ultima;
  override nextPageLabel = this.LABELS.proxima;
  override previousPageLabel = this.LABELS.anterior;
  override itemsPerPageLabel = this.LABELS.itensPorPagina;

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) return this.LABELS.nenhumResultado;
    const totalPaginas = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${totalPaginas}`;
  };
}
