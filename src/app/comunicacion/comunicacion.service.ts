import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface MensajeCreate {
  asignacion_id: number;
  contenido: string;
}

export interface MensajeResponse {
  id: number;
  asignacion_id: number;
  usuario_id: number;
  remitente: string;
  rol: string;
  contenido: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ComunicacionService {
  private readonly API = 'http://127.0.0.1:8000/api/comunicacion';

  constructor(private http: HttpClient) {}

  enviarMensaje(data: MensajeCreate): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.API}/mensajes`, data).pipe(timeout(8000));
  }

  listarMensajes(asignacionId: number): Observable<MensajeResponse[]> {
    return this.http
      .get<MensajeResponse[]>(`${this.API}/asignaciones/${asignacionId}/mensajes`)
      .pipe(timeout(8000));
  }
}
