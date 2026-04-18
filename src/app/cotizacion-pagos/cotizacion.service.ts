import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface ItemCotizacion {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CotizacionCreate {
  incidente_id: number;
  items: ItemCotizacion[];
}

export interface CotizacionResponse {
  id: number;
  incidente_id: number;
  taller_id: number;
  monto_estimado: number;
  detalle: string | null;
  estado: string;
  created_at: string;
}

export interface IncidenteDisponible {
  asignacion_id: number;
  incidente_id: number;
  estado_asignacion: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CotizacionService {
  private readonly API = 'http://127.0.0.1:8000/api/pagos';

  constructor(private http: HttpClient) {}

  listarIncidentesDisponibles(): Observable<IncidenteDisponible[]> {
    return this.http.get<IncidenteDisponible[]>(`${this.API}/incidentes-disponibles`).pipe(timeout(8000));
  }

  generar(data: CotizacionCreate): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.API}/cotizaciones`, data).pipe(timeout(8000));
  }

  listar(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.API}/cotizaciones`).pipe(timeout(8000));
  }

  getById(id: number): Observable<CotizacionResponse> {
    return this.http.get<CotizacionResponse>(`${this.API}/cotizaciones/${id}`).pipe(timeout(8000));
  }

  actualizarEstado(id: number, estado: 'aceptada' | 'rechazada'): Observable<CotizacionResponse> {
    return this.http.patch<CotizacionResponse>(`${this.API}/cotizaciones/${id}/estado`, { estado }).pipe(timeout(8000));
  }

  parsearItems(detalle: string | null): ItemCotizacion[] {
    if (!detalle) return [];
    try { return JSON.parse(detalle); } catch { return []; }
  }
}
