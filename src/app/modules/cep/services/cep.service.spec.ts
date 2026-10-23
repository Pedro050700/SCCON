import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpBackend, HttpXhrBackend, provideHttpClient } from '@angular/common/http';
import { CepService, EnderecoResponse } from './cep.service';

const ENDERECO_MOCK: EnderecoResponse = {
  cep: '01001-000',
  logradouro: 'Praça da Sé',
  complemento: 'lado ímpar',
  bairro: 'Sé',
  localidade: 'São Paulo',
  uf: 'SP',
};

describe('CepService', () => {
  let service: CepService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CepService,
        provideHttpClient(),
        provideHttpClientTesting(),
        // Redireciona HttpXhrBackend para o mesmo backend de testes
        { provide: HttpXhrBackend, useExisting: HttpBackend },
      ]
    });
    service = TestBed.inject(CepService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('buscarEndereco - validação de entrada', () => {
    [
      { desc: 'string vazia',       cep: ''           },
      { desc: 'CEP com 7 dígitos',  cep: '0100100'    },
      { desc: 'CEP com 9 dígitos',  cep: '010010001'  },
      { desc: 'apenas letras',      cep: 'abcdefgh'   },
    ].forEach(({ desc, cep }) => {
      it(`deve retornar erro para ${desc}: "${cep}"`, done => {
        service.buscarEndereco(cep).subscribe({
          next: () => done.fail('Deveria ter lançado erro'),
          error: (err: Error) => {
            expect(err.message).toBe('CEP inválido');
            done();
          }
        });
      });
    });
  });

  describe('buscarEndereco - remoção de máscara', () => {
    it('deve aceitar CEP com máscara "00000-000" e realizar a requisição', () => {
      service.buscarEndereco('01001-000').subscribe();
      httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    });

    it('deve aceitar CEP sem máscara "00000000" e realizar a requisição', () => {
      service.buscarEndereco('01001000').subscribe();
      httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    });
  });

  describe('buscarEndereco - sucesso', () => {
    it('deve retornar o endereço quando CEP for válido', done => {
      service.buscarEndereco('01001-000').subscribe(result => {
        expect(result).toEqual(ENDERECO_MOCK);
        done();
      });

      httpMock.expectOne('https://viacep.com.br/ws/01001000/json/').flush(ENDERECO_MOCK);
    });

    it('deve construir a URL corretamente com o CEP limpo', () => {
      service.buscarEndereco('26087-135').subscribe();
      const req = httpMock.expectOne('https://viacep.com.br/ws/26087135/json/');
      expect(req.request.method).toBe('GET');
      req.flush(ENDERECO_MOCK);
    });
  });

  describe('buscarEndereco - erro HTTP', () => {
    it('deve retornar erro quando a requisição HTTP falhar', done => {
      service.buscarEndereco('01001-000').subscribe({
        next: () => done.fail('Deveria ter retornado erro'),
        error: (err: Error) => {
          expect(err.message).toBe('O serviço ViaCEP está temporariamente indisponível. Tente novamente mais tarde.');
          done();
        }
      });

      httpMock.expectOne('https://viacep.com.br/ws/01001000/json/')
        .flush('Server error', { status: 500, statusText: 'Server Error' });
    });

    it('deve informar quando não houver conexão com o ViaCEP', done => {
      service.buscarEndereco('01001-000').subscribe({
        next: () => done.fail('Deveria ter retornado erro'),
        error: (err: Error) => {
          expect(err.message).toBe('Não foi possível conectar ao ViaCEP. Verifique sua conexão e tente novamente.');
          done();
        }
      });

      httpMock.expectOne('https://viacep.com.br/ws/01001000/json/')
        .error(new ProgressEvent('error'));
    });
  });
});
