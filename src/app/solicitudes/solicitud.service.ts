import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { AsignacionResponse } from '../talleres-tecnicos/tecnico.service';

export interface SolicitudDisponible {
  incidente_id: number;
  latitud: number;
  longitud: number;
  descripcion: string | null;
  tipo_problema: string;
  prioridad: string;
  estado: string;
  fotos_urls: string[];
  tiene_audio: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly API = 'http://127.0.0.1:8000/api/solicitudes';

  constructor(private http: HttpClient) {}

  listarDisponibles(): Observable<SolicitudDisponible[]> {
    return this.http.get<SolicitudDisponible[]>(`${this.API}/disponibles`).pipe(timeout(12000));
  }

  /** CU15 – incidente_id es el id devuelto en listar disponibles. */
  aceptar(incidenteId: number, eta?: number | null): Observable<AsignacionResponse> {
    const body: { eta?: number } = {};
    if (eta != null && eta > 0) body.eta = eta;
    return this.http
      .patch<AsignacionResponse>(`${this.API}/${incidenteId}/aceptar`, body)
      .pipe(timeout(15000));
  }
}
