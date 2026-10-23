import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective } from 'ngx-mask';
import { EMPTY, Subject, catchError, finalize, switchMap, tap, timer } from 'rxjs';
import { Listagem } from '../../components/listagem/listagem.component';
import { CepService, EnderecoResponse } from '../../services/cep.service';
import { BuscaHistoricoService } from '../../services/busca-historico.service';

type TipoMensagem = 'sucesso' | 'erro';

@Component({
  selector: 'sccon-busca-cep',
  imports: [Listagem, ReactiveFormsModule, MatProgressSpinnerModule, NgxMaskDirective],
  templateUrl: './busca.component.html',
  styleUrl: './busca.component.scss'
})
export class Busca {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cepService = inject(CepService);
  private readonly historicoService = inject(BuscaHistoricoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly CEP_PATTERN = /^\d{5}-\d{3}$/;

  private readonly MENSAGENS = {
    formularioInvalido: 'Preencha o CEP corretamente',
    cepNaoEncontrado: 'CEP não encontrado',
    sucesso: 'Busca realizada com sucesso',
    erroPadrao: 'Não foi possível consultar o CEP. Tente novamente.'
  } as const;

  readonly carregando = signal(false);
  readonly mensagem = signal('');
  readonly tipoMensagem = signal<TipoMensagem | ''>('');

  readonly formularioBusca = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(this.CEP_PATTERN)]]
  });

  private readonly buscarTrigger$ = new Subject<string>();

  constructor() {
    this.configurarFluxoBusca();
  }

  private configurarFluxoBusca(): void {
    this.buscarTrigger$.pipe(
      tap(() => this.carregando.set(true)),
      switchMap(cep =>
        this.cepService.buscarEndereco(cep).pipe(
          finalize(() => this.carregando.set(false)),
          catchError((erro: unknown) => {
            const mensagem = erro instanceof Error && erro.message
              ? erro.message
              : this.MENSAGENS.erroPadrao;
            this.exibirMensagem(mensagem, 'erro');
            return EMPTY;
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(endereco => this.processarResposta(endereco));
  }

  buscar(): void {
    if (this.formularioBusca.invalid) {
      this.formularioBusca.markAllAsTouched();
      this.exibirMensagem(this.MENSAGENS.formularioInvalido, 'erro');
      return;
    }

    this.buscarTrigger$.next(this.formularioBusca.controls.cep.value);
  }

  private processarResposta(endereco: EnderecoResponse): void {
    if (endereco.erro) {
      this.exibirMensagem(this.MENSAGENS.cepNaoEncontrado, 'erro');
      return;
    }

    this.historicoService.adicionarBusca({
      cep: endereco.cep,
      endereco: this.montarEnderecoCompleto(endereco),
      dataBusca: new Date()
    });
    this.exibirMensagem(this.MENSAGENS.sucesso, 'sucesso');
    this.formularioBusca.reset();
  }

  private montarEnderecoCompleto(endereco: EnderecoResponse): string {
    return `${endereco.logradouro}, ${endereco.bairro} - ${endereco.localidade}, ${endereco.uf}`;
  }

  private exibirMensagem(msg: string, tipo: TipoMensagem): void {
    this.mensagem.set(msg);
    this.tipoMensagem.set(tipo);
    timer(4000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.mensagem.set('');
      this.tipoMensagem.set('');
    });
  }
}

