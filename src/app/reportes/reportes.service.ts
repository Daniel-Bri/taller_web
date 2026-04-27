import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PagoDetalle {
  pago_id: number;
  monto: number;
  metodo: string;
  fecha: string | null;
  cotizacion_id: number;
  incidente_id: number;
}

export interface MetricasResumenResponse {
  desde: string | null;
  hasta: string | null;
  total_servicios: number;
  servicios_finalizados: number;
  servicios_pagados: number;
  ingresos_brutos: number;
  comision_plataforma: number;
  ingresos_netos: number;
  ticket_promedio: number;
  promedio_calificacion: number | null;
  total_calificaciones: number;
  detalle_pagos: PagoDetalle[];
}

export interface CalificacionPendienteItem {
  asignacion_id: number;
  incidente_id: number;
  taller_id: number;
  taller_nombre: string | null;
  fecha_finalizacion: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly API = `${environment.apiUrl}/api/reportes`;

  constructor(private http: HttpClient) {}

  metricasGlobales(params: { desde?: string; hasta?: string } = {}): Observable<MetricasResumenResponse> {
    const q = this.buildQuery(params);
    return this.http.get<MetricasResumenResponse>(`${this.API}/metricas/globales${q}`).pipe(timeout(12000));
  }

  metricasTaller(params: { desde?: string; hasta?: string } = {}): Observable<MetricasResumenResponse> {
    const q = this.buildQuery(params);
    return this.http.get<MetricasResumenResponse>(`${this.API}/metricas/taller${q}`).pipe(timeout(12000));
  }

  pendientesCalificacion(): Observable<CalificacionPendienteItem[]> {
    return this.http.get<CalificacionPendienteItem[]>(`${this.API}/calificaciones/pendientes`).pipe(timeout(10000));
  }

  calificar(payload: { asignacion_id: number; puntuacion: number; resena?: string }): Observable<unknown> {
    return this.http.post(`${this.API}/calificaciones`, payload).pipe(timeout(10000));
  }

  private buildQuery(params: { desde?: string; hasta?: string }): string {
    const p: string[] = [];
    if (params.desde) p.push(`desde=${encodeURIComponent(params.desde)}`);
    if (params.hasta) p.push(`hasta=${encodeURIComponent(params.hasta)}`);
    return p.length ? `?${p.join('&')}` : '';
  }
}
