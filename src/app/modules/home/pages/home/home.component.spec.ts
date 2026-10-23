import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home.component';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('nomeDesenvolvedor - propriedade readonly', () => {
    it('deve ter o nome do desenvolvedor definido', () => {
      expect(component.nomeDesenvolvedor).toBe('Pedro Henrique');
    });

    it('deve exibir o nome do desenvolvedor no template', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Pedro Henrique');
    });
  });

  describe('dataTeste - propriedade readonly', () => {
    it('deve ter a data do teste definida', () => {
      expect(component.dataTeste).toBe('10/04/2026');
    });

    it('deve exibir a data no template', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('10/04/2026');
    });
  });

  describe('template - estrutura semântica', () => {
    it('deve renderizar o título de boas-vindas', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('h1')?.textContent).toContain('Bem-vindo/a ao Teste de Front-End');
    });

    it('deve exibir nome e data em negrito', () => {
      const strongs = fixture.nativeElement.querySelectorAll('strong');
      const textos = Array.from(strongs).map((s: any) => s.textContent);
      expect(textos).toContain('Pedro Henrique');
      expect(textos).toContain('10/04/2026');
    });
  });
});
