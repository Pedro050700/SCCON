import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BuscasApiService } from './buscas-api.service';
import { BuscaRealizada } from '../modules/cep/services/busca-historico.service';

const BUSCA_MOCK: BuscaRealizada = {
  id: '1',
  cep: '01001-000',
  endereco: 'Praça da Sé, Sé - São Paulo, SP',
  dataBusca: new Date('2026-04-10T12:00:00'),
};

describe('BuscasApiService', () => {
  let service: BuscasApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BuscasApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(BuscasApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('listar - GET /api/buscas', () => {
    it('deve retornar lista de buscas', () => {
      const mockLista = [BUSCA_MOCK];

      service.listar().subscribe(result => {
        expect(result).toEqual(mockLista);
      });

      const req = httpMock.expectOne('api/buscas');
      expect(req.request.method).toBe('GET');
      req.flush(mockLista);
    });

    it('deve retornar lista vazia quando não houver buscas', () => {
      service.listar().subscribe(result => {
        expect(result).toEqual([]);
      });

      httpMock.expectOne('api/buscas').flush([]);
    });
  });

  describe('salvar - POST /api/buscas', () => {
    it('deve enviar busca via POST e retornar registro salvo', () => {
      const { id, ...payload } = BUSCA_MOCK;

      service.salvar(payload).subscribe(result => {
        expect(result).toEqual(BUSCA_MOCK);
      });

      const req = httpMock.expectOne('api/buscas');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(BUSCA_MOCK);
    });
  });

  describe('deletar - DELETE /api/buscas/:id', () => {
    it('deve enviar DELETE com o id correto', () => {
      service.deletar('1').subscribe();

      const req = httpMock.expectOne('api/buscas/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('deve montar a URL corretamente para diferentes ids', () => {
      ['1', 'abc-123', '99'].forEach(id => {
        service.deletar(id).subscribe();
        const req = httpMock.expectOne(`api/buscas/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
      });
    });
  });
});
