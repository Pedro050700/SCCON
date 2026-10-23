import { TestBed } from '@angular/core/testing';
import { InMemoryDataService } from './in-memory-data.service';

describe('InMemoryDataService', () => {
  let service: InMemoryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryDataService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('createDb - estrutura do banco em memória', () => {
    it('deve retornar um objeto com a coleção buscas', () => {
      const db = service.createDb();
      expect(db).toHaveProperty('buscas');
    });

    it('deve inicializar buscas como array vazio', () => {
      const db = service.createDb();
      expect(db.buscas).toEqual([]);
    });
  });

  describe('genId - geração de ID único', () => {
    it('deve retornar 1 quando a lista estiver vazia', () => {
      expect(service.genId([])).toBe(1);
    });

    describe('quando a lista possui itens', () => {
      const casos = [
        { buscas: [{ id: 1 }],           esperado: 2 },
        { buscas: [{ id: 5 }],           esperado: 6 },
        { buscas: [{ id: 3 }, { id: 7 }], esperado: 8 },
        { buscas: [{ id: 10 }, { id: 2 }], esperado: 11 },
      ];

      casos.forEach(({ buscas, esperado }) => {
        it(`deve retornar ${esperado} para ids [${buscas.map(b => b.id).join(', ')}]`, () => {
          expect(service.genId(buscas)).toBe(esperado);
        });
      });
    });
  });
});
