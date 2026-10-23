import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BuscaHistoricoService, BuscaRealizada } from './busca-historico.service';
import { BuscasApiService } from '../../../core/buscas-api.service';

const BUSCA_MOCK: BuscaRealizada = {
  id: '1',
  cep: '01001-000',
  endereco: 'Praça da Sé, Sé - São Paulo, SP',
  dataBusca: new Date('2026-04-10T12:00:00'),
};

const BUSCA_MOCK_2: BuscaRealizada = {
  id: '2',
  cep: '26087-135',
  endereco: 'Rua Júlio Frangile, Austin - Nova Iguaçu, RJ',
  dataBusca: new Date('2026-04-10T13:00:00'),
};

const mockApiService = {
  listar: jest.fn(),
  salvar: jest.fn(),
  deletar: jest.fn(),
};

describe('BuscaHistoricoService', () => {
  let service: BuscaHistoricoService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.listar.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        BuscaHistoricoService,
        { provide: BuscasApiService, useValue: mockApiService },
      ]
    });
    service = TestBed.inject(BuscaHistoricoService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('inicialização - carregarHistorico', () => {
    it('deve carregar o histórico ao ser criado', () => {
      expect(mockApiService.listar).toHaveBeenCalledTimes(1);
    });

    it('deve emitir lista carregada da API', done => {
      mockApiService.listar.mockReturnValue(of([BUSCA_MOCK]));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          BuscaHistoricoService,
          { provide: BuscasApiService, useValue: mockApiService },
        ]
      });
      const svc = TestBed.inject(BuscaHistoricoService);

      svc.historico$.subscribe(buscas => {
        expect(buscas).toEqual([BUSCA_MOCK]);
        done();
      });
    });

    it('deve emitir lista vazia quando a API retornar erro', done => {
      mockApiService.listar.mockReturnValue(throwError(() => new Error('Falha')));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          BuscaHistoricoService,
          { provide: BuscasApiService, useValue: mockApiService },
        ]
      });
      const svc = TestBed.inject(BuscaHistoricoService);

      svc.historico$.subscribe(buscas => {
        expect(buscas).toEqual([]);
        done();
      });
    });
  });

  describe('obterHistorico - observable público', () => {
    it('deve retornar o mesmo observable que historico$', () => {
      expect(service.obterHistorico()).toBe(service.historico$);
    });
  });

  describe('adicionarBusca - POST e recarga', () => {
    it('deve chamar api.salvar com os dados da busca', () => {
      const { id, ...payload } = BUSCA_MOCK;
      mockApiService.salvar.mockReturnValue(of(BUSCA_MOCK));
      mockApiService.listar.mockReturnValue(of([BUSCA_MOCK]));

      service.adicionarBusca(payload);

      expect(mockApiService.salvar).toHaveBeenCalledWith(payload);
    });

    it('deve recarregar o histórico após salvar', () => {
      const { id, ...payload } = BUSCA_MOCK;
      mockApiService.salvar.mockReturnValue(of(BUSCA_MOCK));
      mockApiService.listar.mockReturnValue(of([BUSCA_MOCK]));

      service.adicionarBusca(payload);

      // 1 chamada no constructor + 1 após salvar
      expect(mockApiService.listar).toHaveBeenCalledTimes(2);
    });
  });

  describe('removerBusca - DELETE e atualização local', () => {
    it('deve chamar api.deletar com o id correto', () => {
      mockApiService.deletar.mockReturnValue(of(null));
      service.removerBusca('1');
      expect(mockApiService.deletar).toHaveBeenCalledWith('1');
    });

    it('deve remover a busca do estado local imediatamente', done => {
      mockApiService.listar.mockReturnValue(of([BUSCA_MOCK, BUSCA_MOCK_2]));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          BuscaHistoricoService,
          { provide: BuscasApiService, useValue: mockApiService },
        ]
      });
      const svc = TestBed.inject(BuscaHistoricoService);
      mockApiService.deletar.mockReturnValue(of(null));

      svc.removerBusca('1');

      svc.historico$.subscribe(buscas => {
        expect(buscas).toEqual([BUSCA_MOCK_2]);
        expect(buscas.find(b => b.id === '1')).toBeUndefined();
        done();
      });
    });

    it('deve manter restantes quando remover apenas um', done => {
      mockApiService.listar.mockReturnValue(of([BUSCA_MOCK, BUSCA_MOCK_2]));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          BuscaHistoricoService,
          { provide: BuscasApiService, useValue: mockApiService },
        ]
      });
      const svc = TestBed.inject(BuscaHistoricoService);
      mockApiService.deletar.mockReturnValue(of(null));

      svc.removerBusca('2');

      svc.historico$.subscribe(buscas => {
        expect(buscas).toEqual([BUSCA_MOCK]);
        done();
      });
    });
  });
});
