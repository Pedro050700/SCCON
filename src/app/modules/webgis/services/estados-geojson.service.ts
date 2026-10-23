import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { FeatureCollection } from 'geojson';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Estado } from '../models/estado.model';

@Injectable({ providedIn: 'root' })
export class EstadosGeojsonService {
  private readonly http = inject(HttpClient);

  private readonly MALHAS_URL =
    'https://servicodados.ibge.gov.br/api/v3/malhas/estados?formato=application/vnd.geo+json';
  private readonly LOCALIDADES_URL =
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

  buscarEstados() {
    return forkJoin({
      geojson: this.http.get<FeatureCollection>(this.MALHAS_URL),
      estados: this.http.get<Estado[]>(this.LOCALIDADES_URL),
    }).pipe(
      map(({ geojson, estados }) => {
        const estadosPorCodigo = new Map(estados.map(e => [String(e.id), e]));

        const features = geojson.features.map(feature => {
          const codigo = feature.properties?.['codarea'];
          const estado = estadosPorCodigo.get(codigo);
          return {
            ...feature,
            properties: {
              ...feature.properties,
              nome: estado?.nome ?? 'Desconhecido',
              sigla: estado?.sigla ?? '-',
              regiao: estado?.regiao.nome ?? '-',
            },
          };
        });

        return { ...geojson, features } as FeatureCollection;
      }),
      catchError(() => of(null))
    );
  }
}
