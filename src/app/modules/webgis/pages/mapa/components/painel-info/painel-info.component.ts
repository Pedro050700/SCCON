import { Component, input } from '@angular/core';
import { PropriedadesEstado } from '../../../../models/estado.model';

@Component({
  selector: 'sccon-painel-info',
  templateUrl: './painel-info.component.html',
  styleUrl: './painel-info.component.scss',
})
export class PainelInfo {
  readonly estado = input<PropriedadesEstado | null>(null);
}
