import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorPtBr } from './paginator-pt-br';

describe('PaginatorPtBr', () => {
  let service: PaginatorPtBr;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaginatorPtBr]
    });
    service = TestBed.inject(PaginatorPtBr);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve ser uma instância de MatPaginatorIntl', () => {
    expect(service).toBeInstanceOf(MatPaginatorIntl);
  });

  describe('labels - tradução para PT-BR', () => {
    const labels = [
      { prop: 'firstPageLabel',    esperado: 'Primeira página'  },
      { prop: 'lastPageLabel',     esperado: 'Última página'    },
      { prop: 'nextPageLabel',     esperado: 'Próxima página'   },
      { prop: 'previousPageLabel', esperado: 'Página anterior'  },
      { prop: 'itemsPerPageLabel', esperado: 'Itens por página:' },
    ];

    labels.forEach(({ prop, esperado }) => {
      it(`${prop} deve ser "${esperado}"`, () => {
        expect((service as any)[prop]).toBe(esperado);
      });
    });
  });

  describe('getRangeLabel - formatação do range', () => {
    it('deve retornar "Nenhum resultado" quando length é 0', () => {
      expect(service.getRangeLabel(0, 5, 0)).toBe('Nenhum resultado');
    });

    describe('quando há resultados', () => {
      const casos = [
        { page: 0, pageSize: 5, length: 10,  esperado: 'Página 1 de 2'  },
        { page: 1, pageSize: 5, length: 10,  esperado: 'Página 2 de 2'  },
        { page: 0, pageSize: 5, length: 1,   esperado: 'Página 1 de 1'  },
        { page: 0, pageSize: 5, length: 25,  esperado: 'Página 1 de 5'  },
        { page: 2, pageSize: 10, length: 25, esperado: 'Página 3 de 3'  },
      ];

      casos.forEach(({ page, pageSize, length, esperado }) => {
        it(`página ${page + 1}, tamanho ${pageSize}, total ${length} → "${esperado}"`, () => {
          expect(service.getRangeLabel(page, pageSize, length)).toBe(esperado);
        });
      });
    });
  });
});
