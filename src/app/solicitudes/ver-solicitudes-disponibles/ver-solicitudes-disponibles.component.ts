import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  loading = false;
  errorMsg = '';
  seleccion: SolicitudDisponible | null = null;
  etaMinutos: number | null = null;
  aceptando = false;
  /** Mensaje global al aceptar solicitud (éxito / error). */
  bannerMsg: { tipo: 'ok' | 'error'; texto: string } | null = null;
  private _poll?: ReturnType<typeof setInterval>;

  constructor(private solicitudSvc: SolicitudService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargar();
    this._poll = setInterval(() => this.cargar(true), 20000);
  }

  ngOnDestroy(): void {
    if (this._poll) clearInterval(this._poll);
  }

  cargar(silencioso = false): void {
    if (!silencioso) {
      this.loading = true;
      this.errorMsg = '';
      this.cdr.detectChanges();
    }
    this.solicitudSvc.listarDisponibles().subscribe({
      next: (data) => {
        this.items = data;
        if (this.seleccion) {
          this.seleccion = data.find((d) => d.incidente_id === this.seleccion!.incidente_id) ?? null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg =
          e?.error?.detail ??
          (typeof e?.message === 'string' ? e.message : 'No se pudieron cargar las solicitudes.');
        this.cdr.detectChanges();
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
    const eta = this.etaMinutos != null && this.etaMinutos > 0 ? this.etaMinutos : undefined;
    this.solicitudSvc.aceptar(this.seleccion.incidente_id, eta).subscribe({
      next: (a) => {
        this.aceptando = false;
        this.bannerMsg = {
          tipo: 'ok',
          texto: `Solicitud aceptada. Asignación #${a.id}. El incidente pasó a en proceso.`,
        };
        this.cargar(true);
        this.seleccion = null;
        this.etaMinutos = null;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.aceptando = false;
        const d = e?.error?.detail;
        this.bannerMsg = {
          tipo: 'error',
          texto: typeof d === 'string' ? d : 'No se pudo aceptar la solicitud.',
        };
        this.cdr.detectChanges();
      },
    });
  }

  fotoFullUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  scoreLabel(score: number): string {
    if (score >= 0.7) return 'Muy cercano';
    if (score >= 0.4) return 'Cercano';
    if (score >  0)   return 'Lejano';
    return '';
  }

  scoreClass(score: number): string {
    if (score >= 0.7) return 'badge-success';
    if (score >= 0.4) return 'badge-warning';
    return 'badge-muted';
  }
}
