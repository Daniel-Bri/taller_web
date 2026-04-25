import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService, BitacoraEventoResponse } from './auditoria.service';

const ACCIONES = [
  'login', 'register', 'update_user', 'activate_user', 'deactivate_user',
  'approve_taller', 'reject_taller', 'sos',
];

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
})
export class AuditoriaComponent implements OnInit {
  eventos: BitacoraEventoResponse[] = [];
  loading = false;
  errorMsg = '';

  desde = '';
  hasta = '';
  accionFiltro = '';
  page = 1;
  size = 50;
  total = 0;
  pages = 1;

  detalle: BitacoraEventoResponse | null = null;
  detalleObj: unknown = null;

  readonly acciones = ACCIONES;

  constructor(
    private svc: AuditoriaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    const params: Parameters<typeof this.svc.listar>[0] = { page: this.page, size: this.size };
    if (this.desde) params.desde = new Date(this.desde).toISOString();
    if (this.hasta) {
      const h = new Date(this.hasta);
      h.setHours(23, 59, 59, 999);
      params.hasta = h.toISOString();
    }
    if (this.accionFiltro) params.accion = this.accionFiltro;

    this.svc.listar(params).subscribe({
      next: (res) => {
        this.eventos = res.items;
        this.total = res.total;
        this.pages = res.pages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.name === 'TimeoutError'
          ? 'El servidor no responde.'
          : (err.error?.detail ?? 'Error al cargar auditoría');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void { this.page = 1; this.cargar(); }
  cambiarPagina(p: number): void { this.page = p; this.cargar(); }
  limpiar(): void { this.desde = ''; this.hasta = ''; this.accionFiltro = ''; this.buscar(); }

  verDetalle(e: BitacoraEventoResponse): void {
    this.detalle = e;
    try { this.detalleObj = e.detalle ? JSON.parse(e.detalle) : null; }
    catch { this.detalleObj = e.detalle; }
  }

  cerrarDetalle(): void { this.detalle = null; this.detalleObj = null; }

  exportar(): void {
    const params: Parameters<typeof this.svc.exportar>[0] = {};
    if (this.desde) params.desde = new Date(this.desde).toISOString();
    if (this.hasta) {
      const h = new Date(this.hasta);
      h.setHours(23, 59, 59, 999);
      params.hasta = h.toISOString();
    }
    if (this.accionFiltro) params.accion = this.accionFiltro;
    this.svc.exportar(params).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'auditoria.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al exportar';
        this.cdr.detectChanges();
      },
    });
  }

  badgeAccion(accion: string): string {
    const m: Record<string, string> = {
      login: 'badge-primary', register: 'badge-success',
      update_user: 'badge-warning', activate_user: 'badge-success',
      deactivate_user: 'badge-danger', approve_taller: 'badge-success',
      reject_taller: 'badge-danger', sos: 'badge-danger',
    };
    return m[accion] ?? 'badge-muted';
  }

  formatDetalle(raw: string | null): string {
    if (!raw) return '—';
    try { return JSON.stringify(JSON.parse(raw), null, 2); }
    catch { return raw; }
  }
}
