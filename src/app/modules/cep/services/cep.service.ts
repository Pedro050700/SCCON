import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpXhrBackend } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EnderecoResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private apiUrl = 'https://viacep.com.br/ws';

  // HttpXhrBackend é o backend XHR nativo — não é substituído pelo in-memory web api
  private http = new HttpClient(inject(HttpXhrBackend));

  buscarEndereco(cep: string): Observable<EnderecoResponse> {
    // Remove máscara do CEP (00000-000 → 00000000)
    const cepLimpo = cep.replace(/\D/g, '');

    if (!cepLimpo || cepLimpo.length !== 8) {
      return throwError(() => new Error('CEP inválido'));
    }

    return this.http
      .get<EnderecoResponse>(`${this.apiUrl}/${cepLimpo}/json/`)
      .pipe(
        catchError((erro: unknown) => {
          console.error('Erro ao buscar CEP:', erro);
          return throwError(() => new Error(this.obterMensagemErro(erro)));
        })
      );
  }

  /** Diferencia falhas de conexão, indisponibilidade do serviço e erros HTTP. */
  private obterMensagemErro(erro: unknown): string {
    if (!(erro instanceof HttpErrorResponse)) {
      return 'Não foi possível consultar o CEP. Tente novamente.';
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao ViaCEP. Verifique sua conexão e tente novamente.';
    }

    if (erro.status >= 500) {
      return 'O serviço ViaCEP está temporariamente indisponível. Tente novamente mais tarde.';
    }

    return 'Não foi possível consultar o CEP. Confira o CEP informado e tente novamente.';
  }
}
