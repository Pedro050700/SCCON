import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HeaderMenu } from './header-menu.component';

describe('HeaderMenu', () => {
  let component: HeaderMenu;
  let fixture: ComponentFixture<HeaderMenu>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMenu],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMenu);
    component = fixture.componentInstance;
    nativeEl = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('menuAberto deve ser false', () => {
      expect(component.menuAberto).toBe(false);
    });

    it('subMenuEnderecosAberto deve ser false', () => {
      expect(component.subMenuEnderecosAberto).toBe(false);
    });
  });

  describe('toggle - menu mobile', () => {
    it('deve abrir o menu ao chamar toggle quando fechado', () => {
      component.toggle();
      expect(component.menuAberto).toBe(true);
    });

    it('deve fechar o menu ao chamar toggle quando aberto', () => {
      component.menuAberto = true;
      component.toggle();
      expect(component.menuAberto).toBe(false);
    });

    it('deve alternar o estado a cada chamada', () => {
      [true, false, true].forEach(esperado => {
        component.toggle();
        expect(component.menuAberto).toBe(esperado);
      });
    });
  });

  describe('fecharMenu - fechar tudo', () => {
    it('deve fechar menu e submenu', () => {
      component.menuAberto = true;
      component.subMenuEnderecosAberto = true;
      component.fecharMenu();
      expect(component.menuAberto).toBe(false);
      expect(component.subMenuEnderecosAberto).toBe(false);
    });

    it('não deve lançar erro se já estiver fechado', () => {
      expect(() => component.fecharMenu()).not.toThrow();
    });
  });

  describe('toggleSubMenuEnderecos - submenu endereços', () => {
    it('deve abrir o submenu quando fechado', () => {
      const evento = new MouseEvent('click');
      component.toggleSubMenuEnderecos(evento);
      expect(component.subMenuEnderecosAberto).toBe(true);
    });

    it('deve fechar o submenu quando aberto', () => {
      component.subMenuEnderecosAberto = true;
      const evento = new MouseEvent('click');
      component.toggleSubMenuEnderecos(evento);
      expect(component.subMenuEnderecosAberto).toBe(false);
    });

    it('deve chamar preventDefault no evento', () => {
      const evento = new MouseEvent('click');
      const spy = jest.spyOn(evento, 'preventDefault');
      component.toggleSubMenuEnderecos(evento);
      expect(spy).toHaveBeenCalled();
    });

    it('deve chamar stopPropagation no evento', () => {
      const evento = new MouseEvent('click');
      const spy = jest.spyOn(evento, 'stopPropagation');
      component.toggleSubMenuEnderecos(evento);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('clickFora - fechar ao clicar fora', () => {
    it('deve fechar menus ao clicar fora do componente', () => {
      component.menuAberto = true;
      component.subMenuEnderecosAberto = true;

      const eventoFora = new MouseEvent('click');
      Object.defineProperty(eventoFora, 'target', { value: document.body });
      component.clickFora(eventoFora);

      expect(component.menuAberto).toBe(false);
      expect(component.subMenuEnderecosAberto).toBe(false);
    });

    it('deve manter menus abertos ao clicar dentro do componente', () => {
      component.menuAberto = true;
      component.subMenuEnderecosAberto = true;

      const eventoDentro = new MouseEvent('click');
      Object.defineProperty(eventoDentro, 'target', { value: nativeEl });
      component.clickFora(eventoDentro);

      expect(component.menuAberto).toBe(true);
      expect(component.subMenuEnderecosAberto).toBe(true);
    });
  });
});
