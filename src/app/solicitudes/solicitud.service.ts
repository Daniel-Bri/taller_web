import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { AsignacionResponse } from '../talleres-tecnicos/tecnico.service';

export interface AsignacionResumen {
  id: number;
  estado: string;
  eta: number | null;
  taller_id: number;
  taller_nombre: string | null;
  tecnico_id: number | null;
  observacion: string | null;
}

export interface IncidenteResumen {
  id: number;
  vehiculo_id: number;
  estado: string;
  prioridad: string;
  descripcion: string | null;
  latitud: number | null;
  longitud: number | null;
  created_at: string;
}

export interface MiSolicitud {
  incidente: IncidenteResumen;
  asignacion: AsignacionResumen | null;
  fotos_urls: string[];
}

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
  distancia_km?: number | null;
  created_at: string;
}

export interface ClasificacionIA {
  categoria: string;
  confianza: number | null;
  resumen: string | null;
}

export interface SolicitudDetalle {
  incidente: IncidenteResumen;
  asignacion: AsignacionResumen | null;
  clasificacion_ia: ClasificacionIA | null;
  fotos_urls: string[];
  audios_urls: string[];
}

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly API = `${environment.apiUrl}/api/solicitudes`;

  constructor(private http: HttpClient) {}

  misSolicitudes(): Observable<MiSolicitud[]> {
    return this.http
      .get<MiSolicitud[]>(`${environment.apiUrl}/api/emergencias/mis-solicitudes`)
      .pipe(timeout(12000));
  }

  listarDisponibles(): Observable<SolicitudDisponible[]> {
    return this.http.get<SolicitudDisponible[]>(`${this.API}/disponibles`).pipe(timeout(12000));
  }

  detalleIncidente(incidenteId: number): Observable<SolicitudDetalle> {
    return this.http
      .get<SolicitudDetalle>(`${this.API}/${incidenteId}`)
      .pipe(timeout(12000));
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
