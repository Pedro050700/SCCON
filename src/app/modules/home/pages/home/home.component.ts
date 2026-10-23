import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sccon-home',
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home {
  readonly nomeDesenvolvedor = 'Pedro Henrique';
  readonly dataTeste = '10/04/2026';
}
