import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notificacion {
  id: number;
  user_id: number;
  incidente_id: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly API = `${environment.apiUrl}/api/comunicacion`;

  constructor(private http: HttpClient) {}

  listarMias(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.API}/notificaciones/mias`).pipe(timeout(10000));
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.API}/notificaciones/${id}/leida`, {}).pipe(timeout(10000));
  }
}
