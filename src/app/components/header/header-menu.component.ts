import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'sccon-header-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-menu.component.html',
  styleUrl: './header-menu.component.scss'
})
export class HeaderMenu {
  private readonly elementRef = inject(ElementRef);

  menuAberto = false;
  subMenuEnderecosAberto = false;

  @HostListener('document:click', ['$event'])
  clickFora(evento: MouseEvent): void {
    const clicouDentro = this.elementRef.nativeElement.contains(evento.target as HTMLElement);
    if (clicouDentro) return;
    this.fecharMenu();
  }

  toggle(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
    this.subMenuEnderecosAberto = false;
  }

  toggleSubMenuEnderecos(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.subMenuEnderecosAberto = !this.subMenuEnderecosAberto;
  }
}

