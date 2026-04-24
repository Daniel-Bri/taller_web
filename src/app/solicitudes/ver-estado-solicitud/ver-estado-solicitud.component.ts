import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService, MiSolicitud } from '../solicitud.service';

@Component({
  selector: 'app-ver-estado-solicitud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-estado-solicitud.component.html',
})
export class VerEstadoSolicitudComponent implements OnInit, OnDestroy {
  items: MiSolicitud[] = [];
  loading = false;
  errorMsg = '';
  private _poll?: ReturnType<typeof setInterval>;

  constructor(private solicitudSvc: SolicitudService) {}

  ngOnInit(): void {
    this.cargar();
    this._poll = setInterval(() => this.cargar(true), 15000);
  }

  ngOnDestroy(): void {
    if (this._poll) clearInterval(this._poll);
  }

  cargar(silencioso = false): void {
    if (!silencioso) {
      this.loading = true;
      this.errorMsg = '';
    }
    this.solicitudSvc.misSolicitudes().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg =
          e?.error?.detail ??
          (typeof e?.message === 'string' ? e.message : 'No se pudieron cargar las solicitudes.');
      },
    });
  }

  labelIncidente(e: string): string {
    const m: Record<string, string> = {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      resuelto: 'Atendido',
      cancelado: 'Cancelado',
    };
    return m[e] ?? e;
  }

  labelAsignacion(e: string): string {
    const m: Record<string, string> = {
      aceptado: 'Aceptado',
      en_camino: 'En camino',
      en_sitio: 'En sitio',
      en_reparacion: 'En reparación',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return m[e] ?? e;
  }

  badgeClass(estado: string): string {
    const m: Record<string, string> = {
      pendiente: 'badge-warning',
      en_proceso: 'badge-info',
      resuelto: 'badge-success',
      cancelado: 'badge-danger',
      aceptado: 'badge-info',
      en_camino: 'badge-info',
      en_sitio: 'badge-primary',
      en_reparacion: 'badge-primary',
      finalizado: 'badge-success',
    };
    return m[estado] ?? 'badge-muted';
  }
}
