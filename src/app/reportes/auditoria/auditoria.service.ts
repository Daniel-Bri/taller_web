import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BitacoraEventoResponse {
  id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  accion: string;
  entidad: string | null;
  entidad_id: number | null;
  detalle: string | null;
  ip: string | null;
  created_at: string;
}

export interface AuditoriaListResponse {
  items: BitacoraEventoResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly API = `${environment.apiUrl}/api/reportes`;

  constructor(private http: HttpClient) {}

  listar(params: {
    desde?: string; hasta?: string; accion?: string;
    usuario_id?: number; page?: number; size?: number;
  } = {}): Observable<AuditoriaListResponse> {
    const p: string[] = [];
    if (params.desde)      p.push(`desde=${encodeURIComponent(params.desde)}`);
    if (params.hasta)      p.push(`hasta=${encodeURIComponent(params.hasta)}`);
    if (params.accion)     p.push(`accion=${params.accion}`);
    if (params.usuario_id) p.push(`usuario_id=${params.usuario_id}`);
    if (params.page)       p.push(`page=${params.page}`);
    if (params.size)       p.push(`size=${params.size}`);
    const query = p.length ? '?' + p.join('&') : '';
    return this.http.get<AuditoriaListResponse>(`${this.API}/auditoria${query}`).pipe(timeout(10000));
  }

  detalle(id: number): Observable<BitacoraEventoResponse> {
    return this.http.get<BitacoraEventoResponse>(`${this.API}/auditoria/${id}`).pipe(timeout(8000));
  }

  exportar(params: { desde?: string; hasta?: string; accion?: string; usuario_id?: number } = {}): Observable<Blob> {
    const p: string[] = [];
    if (params.desde)      p.push(`desde=${encodeURIComponent(params.desde)}`);
    if (params.hasta)      p.push(`hasta=${encodeURIComponent(params.hasta)}`);
    if (params.accion)     p.push(`accion=${params.accion}`);
    if (params.usuario_id) p.push(`usuario_id=${params.usuario_id}`);
    const query = p.length ? '?' + p.join('&') : '';
    return this.http.get(`${this.API}/auditoria/exportar${query}`, { responseType: 'blob' }).pipe(timeout(15000));
  }
}
