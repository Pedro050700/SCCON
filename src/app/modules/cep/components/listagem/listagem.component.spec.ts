import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { Listagem } from './listagem.component';
import { BuscaHistoricoService, BuscaRealizada } from '../../services/busca-historico.service';

const BUSCA_MOCK: BuscaRealizada = {
  id: '1',
  cep: '01001-000',
  endereco: 'Praça da Sé, Sé - São Paulo, SP',
  dataBusca: new Date('2026-04-10T12:30:00'),
};

const BUSCA_MOCK_2: BuscaRealizada = {
  id: '2',
  cep: '26087-135',
  endereco: 'Rua Júlio Frangile, Austin - Nova Iguaçu, RJ',
  dataBusca: new Date('2026-04-10T13:45:00'),
};

describe('Listagem', () => {
  let component: Listagem;
  let fixture: ComponentFixture<Listagem>;
  let historicoSubject: BehaviorSubject<BuscaRealizada[]>;

  const mockHistoricoService = {
    obterHistorico: jest.fn(),
    removerBusca: jest.fn(),
  };

  beforeEach(async () => {
    historicoSubject = new BehaviorSubject<BuscaRealizada[]>([]);
    mockHistoricoService.obterHistorico.mockReturnValue(historicoSubject.asObservable());
    mockHistoricoService.removerBusca.mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [Listagem],
      providers: [
        provideAnimations(),
        { provide: BuscaHistoricoService, useValue: mockHistoricoService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Listagem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('configuração inicial', () => {
    it('deve ter as colunas definidas corretamente', () => {
      expect(component.colunas).toEqual(['cep', 'endereco', 'dataBusca', 'acao']);
    });

    it('deve ter pageSize igual a 5', () => {
      expect(component.pageSize).toBe(5);
    });

    it('temBuscas deve ser false quando não há buscas', () => {
      expect(component.temBuscas()).toBe(false);
    });
  });

  describe('temBuscas - signal computed', () => {
    it('deve retornar true quando há buscas', () => {
      historicoSubject.next([BUSCA_MOCK]);
      fixture.detectChanges();
      expect(component.temBuscas()).toBe(true);
    });

    it('deve retornar false quando lista está vazia', () => {
      historicoSubject.next([]);
      fixture.detectChanges();
      expect(component.temBuscas()).toBe(false);
    });

    it('deve atualizar corretamente ao variar a quantidade', () => {
      historicoSubject.next([BUSCA_MOCK, BUSCA_MOCK_2]);
      expect(component.temBuscas()).toBe(true);

      historicoSubject.next([]);
      expect(component.temBuscas()).toBe(false);
    });
  });

  describe('dataSource - mapeamento para BuscaRealizadaView', () => {
    it('deve popular dataSource ao receber buscas', () => {
      historicoSubject.next([BUSCA_MOCK]);
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBe(1);
    });

    it('deve incluir dataFormatada em cada item', () => {
      historicoSubject.next([BUSCA_MOCK]);
      fixture.detectChanges();
      expect(component.dataSource.data[0].dataFormatada).toBeDefined();
      expect(typeof component.dataSource.data[0].dataFormatada).toBe('string');
    });

    it('dataFormatada deve conter data e hora no formato correto', () => {
      historicoSubject.next([BUSCA_MOCK]);
      fixture.detectChanges();
      const dataFormatada = component.dataSource.data[0].dataFormatada;
      expect(dataFormatada).toMatch(/\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}/);
    });

    it('deve atualizar dataSource ao receber nova lista', () => {
      historicoSubject.next([BUSCA_MOCK]);
      expect(component.dataSource.data.length).toBe(1);

      historicoSubject.next([BUSCA_MOCK, BUSCA_MOCK_2]);
      expect(component.dataSource.data.length).toBe(2);
    });

    it('deve preservar cep e endereco originais na view', () => {
      historicoSubject.next([BUSCA_MOCK]);
      fixture.detectChanges();
      const item = component.dataSource.data[0];
      expect(item.cep).toBe(BUSCA_MOCK.cep);
      expect(item.endereco).toBe(BUSCA_MOCK.endereco);
      expect(item.id).toBe(BUSCA_MOCK.id);
    });
  });

  describe('deletarBusca - delegação ao serviço', () => {
    it('deve chamar historicoService.removerBusca com o id correto', () => {
      component.deletarBusca('1');
      expect(mockHistoricoService.removerBusca).toHaveBeenCalledWith('1');
    });

    it('deve chamar removerBusca apenas uma vez por chamada', () => {
      jest.clearAllMocks();
      component.deletarBusca('1');
      expect(mockHistoricoService.removerBusca).toHaveBeenCalledTimes(1);
    });

    ['1', 'abc-123', '99'].forEach(id => {
      it(`deve passar o id "${id}" corretamente`, () => {
        component.deletarBusca(id);
        expect(mockHistoricoService.removerBusca).toHaveBeenCalledWith(id);
      });
    });
  });
});
