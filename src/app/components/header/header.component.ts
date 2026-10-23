import { Component } from '@angular/core';
import { HeaderMenu } from './header-menu.component';

@Component({
  selector: 'sccon-header',
  imports: [HeaderMenu],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class Header {}

