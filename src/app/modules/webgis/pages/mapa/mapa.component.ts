import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import type { FeatureCollection } from 'geojson';
import { PropriedadesEstado } from '../../models/estado.model';
import { EstadosGeojsonService } from '../../services/estados-geojson.service';
import { PainelInfo } from './components/painel-info/painel-info.component';

@Component({
  selector: 'sccon-mapa-webgis',
  imports: [PainelInfo, MatProgressSpinnerModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class Mapa {
  private readonly service = inject(EstadosGeojsonService);
  private readonly mapaRef = viewChild.required<ElementRef>('mapaContainer');

  readonly estadoSelecionado = signal<PropriedadesEstado | null>(null);
  private readonly mapaPronto = signal(false);

  readonly dadosEstados = toSignal(this.service.buscarEstados());

  readonly carregando = computed(() => this.dadosEstados() === undefined);
  readonly erro = computed(
    () => !this.carregando() && this.dadosEstados() === null
  );

  private mapa!: L.Map;
  private camadaSelecionada: L.Path | null = null;

  private readonly ESTILO_BASE: L.PathOptions = {
    fillColor: '#132745',
    fillOpacity: 0.2,
    color: '#132745',
    weight: 1.5,
  };

  private readonly ESTILO_DESTAQUE: L.PathOptions = {
    fillColor: '#9b1515',
    fillOpacity: 0.5,
    color: '#132745',
    weight: 2.5,
  };

  private readonly ESTILO_SELECIONADO: L.PathOptions = {
    fillColor: '#c62828',
    fillOpacity: 0.65,
    color: '#420000',
    weight: 3,
  };

  constructor() {
    afterNextRender(() => {
      this.inicializarMapa();
      this.mapaPronto.set(true);
    });

    effect(() => {
      const geojson = this.dadosEstados();
      if (!this.mapaPronto() || !geojson) return;
      this.renderizarGeoJSON(geojson);
    });
  }

  private inicializarMapa(): void {
    this.mapa = L.map(this.mapaRef().nativeElement, {
      center: [-14.235, -51.925],
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.mapa);
  }

  private renderizarGeoJSON(geojson: FeatureCollection): void {
    L.geoJSON(geojson, {
      style: () => ({ ...this.ESTILO_BASE }),
      onEachFeature: (feature, layer) => {
        const path = layer as L.Path;

        layer.on({
          mouseover: () => {
            if (path !== this.camadaSelecionada) {
              path.setStyle(this.ESTILO_DESTAQUE);
            }
          },
          mouseout: () => {
            if (path !== this.camadaSelecionada) {
              path.setStyle(this.ESTILO_BASE);
            }
          },
          click: (e: L.LeafletMouseEvent) => {
            if (this.camadaSelecionada) {
              this.camadaSelecionada.setStyle(this.ESTILO_BASE);
            }
            this.camadaSelecionada = path;
            path.setStyle(this.ESTILO_SELECIONADO);
            this.estadoSelecionado.set(
              feature.properties as PropriedadesEstado
            );
            this.mapa.fitBounds((layer as L.Polygon).getBounds(), {
              padding: [40, 40],
            });
          },
        });
      },
    }).addTo(this.mapa);
  }
}
