import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';
import { of, throwError } from 'rxjs';
import { Busca } from './busca.component';
import { CepService, EnderecoResponse } from '../../services/cep.service';
import { BuscaHistoricoService } from '../../services/busca-historico.service';

const enderecoMock: EnderecoResponse = {
  cep: '01001-000',
  logradouro: 'Praça da Sé',
  complemento: 'lado ímpar',
  bairro: 'Sé',
  localidade: 'São Paulo',
  uf: 'SP'
};

const enderecoNaoEncontrado: EnderecoResponse = { ...enderecoMock, erro: true };

describe('Busca', () => {
  let component: Busca;
  let fixture: ComponentFixture<Busca>;
  let mockCepService: { buscarEndereco: jest.Mock };
  let mockHistoricoService: { obterHistorico: jest.Mock; adicionarBusca: jest.Mock; removerBusca: jest.Mock };

  beforeEach(async () => {
    mockCepService = { buscarEndereco: jest.fn() };
    mockHistoricoService = {
      obterHistorico: jest.fn().mockReturnValue(of([])),
      adicionarBusca: jest.fn(),
      removerBusca: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Busca],
      providers: [
        provideNgxMask(),
        { provide: CepService, useValue: mockCepService },
        { provide: BuscaHistoricoService, useValue: mockHistoricoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Busca);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('carregando deve ser false', () => {
      expect(component.carregando()).toBe(false);
    });

    it('mensagem deve ser string vazia', () => {
      expect(component.mensagem()).toBe('');
    });

    it('tipoMensagem deve ser string vazia', () => {
      expect(component.tipoMensagem()).toBe('');
    });

    it('formularioBusca deve iniciar inválido', () => {
      expect(component.formularioBusca.valid).toBe(false);
    });
  });

  describe('validação do campo cep', () => {
    const cepsInvalidos = [
      { valor: '', descricao: 'vazio' },
      { valor: '1234-678', descricao: 'apenas 4 dígitos antes do traço' },
      { valor: '12345-67', descricao: 'incompleto (2 dígitos após o traço)' },
      { valor: '123-678', descricao: 'só 3 dígitos antes do traço' }
    ];

    cepsInvalidos.forEach(({ valor, descricao }) => {
      it(`deve ser inválido para: ${descricao}`, () => {
        component.formularioBusca.controls.cep.setValue(valor);
        expect(component.formularioBusca.controls.cep.valid).toBe(false);
      });
    });

    it('deve ser válido para cep no formato "12345-678"', () => {
      component.formularioBusca.controls.cep.setValue('12345-678');
      expect(component.formularioBusca.controls.cep.valid).toBe(true);
    });
  });

  describe('buscar - formulário inválido', () => {
    it('deve marcar todos os campos como tocados', fakeAsync(() => {
      component.buscar();
      flush();
      expect(component.formularioBusca.controls.cep.touched).toBe(true);
    }));

    it('deve exibir mensagem de formulário inválido', fakeAsync(() => {
      component.buscar();
      expect(component.mensagem()).toBe('Preencha o CEP corretamente');
      flush();
    }));

    it('deve definir tipoMensagem como erro', fakeAsync(() => {
      component.buscar();
      expect(component.tipoMensagem()).toBe('erro');
      flush();
    }));

    it('não deve chamar o serviço de busca', fakeAsync(() => {
      component.buscar();
      flush();
      expect(mockCepService.buscarEndereco).not.toHaveBeenCalled();
    }));
  });

  describe('buscar - disparar requisição', () => {
    beforeEach(() => {
      component.formularioBusca.controls.cep.setValue('01001-000');
    });

    it('deve chamar buscarEndereco com o CEP informado', fakeAsync(() => {
      mockCepService.buscarEndereco.mockReturnValue(of(enderecoMock));
      component.buscar();
      tick();
      flush();
      expect(mockCepService.buscarEndereco).toHaveBeenCalledWith('01001-000');
    }));

    it('deve definir carregando como true durante a requisição', fakeAsync(() => {
      let carregandoDuranteBusca = false;
      mockCepService.buscarEndereco.mockImplementation(() => {
        carregandoDuranteBusca = component.carregando();
        return of(enderecoMock);
      });
      component.buscar();
      tick();
      flush();
      expect(carregandoDuranteBusca).toBe(true);
    }));

    it('deve definir carregando como false após a requisição', fakeAsync(() => {
      mockCepService.buscarEndereco.mockReturnValue(of(enderecoMock));
      component.buscar();
      tick();
      flush();
      expect(component.carregando()).toBe(false);
    }));
  });

  describe('buscar - CEP encontrado', () => {
    beforeEach(() => {
      component.formularioBusca.controls.cep.setValue('01001-000');
      mockCepService.buscarEndereco.mockReturnValue(of(enderecoMock));
    });

    it('deve adicionar busca ao histórico com cep e endereço corretos', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      expect(mockHistoricoService.adicionarBusca).toHaveBeenCalledWith(
        expect.objectContaining({
          cep: '01001-000',
          endereco: 'Praça da Sé, Sé - São Paulo, SP'
        })
      );
    }));

    it('deve incluir dataBusca do tipo Date no histórico', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      const chamada = mockHistoricoService.adicionarBusca.mock.calls[0][0];
      expect(chamada.dataBusca).toBeInstanceOf(Date);
    }));

    it('deve montar endereço no formato "logradouro, bairro - localidade, uf"', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      const chamada = mockHistoricoService.adicionarBusca.mock.calls[0][0];
      expect(chamada.endereco).toBe('Praça da Sé, Sé - São Paulo, SP');
    }));

    it('deve exibir mensagem de sucesso', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.mensagem()).toBe('Busca realizada com sucesso');
      flush();
    }));

    it('deve definir tipoMensagem como sucesso', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.tipoMensagem()).toBe('sucesso');
      flush();
    }));

    it('deve resetar o formulário após busca bem-sucedida', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      expect(component.formularioBusca.controls.cep.value).toBe('');
    }));
  });

  describe('buscar - CEP não encontrado (erro: true)', () => {
    beforeEach(() => {
      component.formularioBusca.controls.cep.setValue('00000-000');
      mockCepService.buscarEndereco.mockReturnValue(of(enderecoNaoEncontrado));
    });

    it('deve exibir mensagem de CEP não encontrado', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.mensagem()).toBe('CEP não encontrado');
      flush();
    }));

    it('deve definir tipoMensagem como erro', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.tipoMensagem()).toBe('erro');
      flush();
    }));

    it('não deve adicionar busca ao histórico', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      expect(mockHistoricoService.adicionarBusca).not.toHaveBeenCalled();
    }));
  });

  describe('buscar - erro HTTP', () => {
    beforeEach(() => {
      component.formularioBusca.controls.cep.setValue('01001-000');
      mockCepService.buscarEndereco.mockReturnValue(throwError(() => new Error('HTTP error')));
    });

    it('deve exibir mensagem de erro genérico', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.mensagem()).toBe('HTTP error');
      flush();
    }));

    it('deve definir tipoMensagem como erro', fakeAsync(() => {
      component.buscar();
      tick();
      expect(component.tipoMensagem()).toBe('erro');
      flush();
    }));

    it('deve definir carregando como false após o erro', fakeAsync(() => {
      component.buscar();
      tick();
      flush();
      expect(component.carregando()).toBe(false);
    }));
  });

  describe('exibirMensagem - limpeza automática após 4 segundos', () => {
    it('deve limpar a mensagem após 4 segundos', fakeAsync(() => {
      component.buscar();
      expect(component.mensagem()).toBe('Preencha o CEP corretamente');
      tick(4000);
      expect(component.mensagem()).toBe('');
    }));

    it('deve limpar tipoMensagem após 4 segundos', fakeAsync(() => {
      component.buscar();
      expect(component.tipoMensagem()).toBe('erro');
      tick(4000);
      expect(component.tipoMensagem()).toBe('');
    }));
  });
});
