import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sccon-app';
}
