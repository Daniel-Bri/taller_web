import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService, SolicitudDisponible } from '../solicitud.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ver-solicitudes-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-solicitudes-disponibles.component.html',
  styleUrl: './ver-solicitudes-disponibles.component.css',
})
export class VerSolicitudesDisponiblesComponent implements OnInit, OnDestroy {
  items: SolicitudDisponible[] = [];
  filtered: SolicitudDisponible[] = [];
  loading = false;
  errorMsg = '';
  seleccion: SolicitudDisponible | null = null; // modal
  etaMinutos: number | null = null;
  aceptando = false;
  /** Mensaje global al aceptar solicitud (éxito / error). */
  bannerMsg: { tipo: 'ok' | 'error'; texto: string } | null = null;
  prioridadFiltro = '';
  distanciaFiltro = '';
  private _poll?: ReturnType<typeof setInterval>;
  private _aceptarWatchdog?: ReturnType<typeof setTimeout>;

  constructor(private solicitudSvc: SolicitudService) {}

  ngOnInit(): void {
    this.cargar();
    this._poll = setInterval(() => this.cargar(true), 20000);
  }

  ngOnDestroy(): void {
    if (this._poll) clearInterval(this._poll);
    if (this._aceptarWatchdog) clearTimeout(this._aceptarWatchdog);
  }

  cargar(silencioso = false): void {
    if (!silencioso) {
      this.loading = true;
      this.errorMsg = '';
    }
    this.solicitudSvc.listarDisponibles().subscribe({
      next: (data) => {
        this.items = data;
        this.aplicarFiltros();
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

  prioridadClass(p: string): string {
    if (p === 'alta') return 'badge-danger';
    if (p === 'media') return 'badge-warning';
    return 'badge-muted';
  }

  prioridadLabel(p: string): string {
    const m: Record<string, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };
    return m[p] ?? p;
  }

  abrirDetalle(s: SolicitudDisponible): void {
    this.seleccion = s;
  }

  cerrarDetalle(): void {
    this.seleccion = null;
    this.etaMinutos = null;
  }

  cerrarBanner(): void {
    this.bannerMsg = null;
  }

  aceptarSeleccion(): void {
    if (!this.seleccion || this.aceptando) return;
    this.aceptando = true;
    this.bannerMsg = null;
    if (this._aceptarWatchdog) clearTimeout(this._aceptarWatchdog);
    this._aceptarWatchdog = setTimeout(() => {
      if (!this.aceptando) return;
      this.aceptando = false;
      this.bannerMsg = {
        tipo: 'error',
        texto: 'La aceptación está tardando demasiado. Reintenta o actualiza la página.',
      };
    }, 20000);
    const eta = this.etaMinutos != null && this.etaMinutos > 0 ? this.etaMinutos : undefined;
    this.solicitudSvc.aceptar(this.seleccion.incidente_id, eta).subscribe({
      next: (a) => {
        if (this._aceptarWatchdog) clearTimeout(this._aceptarWatchdog);
        this.aceptando = false;
        this.bannerMsg = {
          tipo: 'ok',
          texto: `Solicitud aceptada. Asignación #${a.id}. El incidente pasó a en proceso.`,
        };
        if (typeof window !== 'undefined') {
          window.alert(`Solicitud aceptada (#${a.id}).`);
        }
        this.cargar(true);
        this.seleccion = null;
        this.etaMinutos = null;
      },
      error: (e) => {
        if (this._aceptarWatchdog) clearTimeout(this._aceptarWatchdog);
        this.aceptando = false;
        const d = e?.error?.detail;
        this.bannerMsg = {
          tipo: 'error',
          texto: typeof d === 'string' ? d : 'No se pudo aceptar la solicitud.',
        };
      },
    });
  }

  aplicarFiltros(): void {
    this.filtered = this.items.filter((s) => {
      if (this.prioridadFiltro && s.prioridad !== this.prioridadFiltro) return false;
      if (this.distanciaFiltro) {
        const d = this.distanciaKm(s);
        if (this.distanciaFiltro === '<5' && d >= 5) return false;
        if (this.distanciaFiltro === '5-10' && (d < 5 || d > 10)) return false;
        if (this.distanciaFiltro === '>10' && d <= 10) return false;
      }
      return true;
    });
    if (this.seleccion) {
      this.seleccion = this.filtered.find((x) => x.incidente_id === this.seleccion!.incidente_id) ?? null;
    }
  }

  distanciaKm(s: SolicitudDisponible): number {
    if (typeof s.distancia_km === 'number') {
      return Number(s.distancia_km.toFixed(1));
    }
    return 0;
  }

  tiempoRelativo(created: string): string {
    const d = new Date(created);
    const diffMin = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    const h = Math.floor(diffMin / 60);
    return `Hace ${h} hora${h > 1 ? 's' : ''}`;
  }

  fotoFullUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
