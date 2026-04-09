import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculoService, TallerResponse } from '../vehiculo.service';

type Filtro = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobado',  label: 'Aprobados'  },
  { value: 'rechazado', label: 'Rechazados' },
  { value: 'todos',     label: 'Todos'      },
];

@Component({
  selector: 'app-aprobar-talleres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aprobar-talleres.component.html',
})
export class AprobarTalleresComponent implements OnInit {
  readonly filtros = FILTROS;
  talleres: TallerResponse[] = [];
  filtro: Filtro = 'pendiente';
  loading = false;
  errorMsg = '';

  // Para feedback por fila
  procesando: Record<number, 'aprobando' | 'rechazando' | null> = {};
  mensajeFila: Record<number, { tipo: 'ok' | 'error'; texto: string }> = {};

  constructor(private vehiculoService: VehiculoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    const estado = this.filtro === 'todos' ? undefined : this.filtro;
    this.vehiculoService.listarTalleres(estado).subscribe({
      next: (data) => {
        this.talleres = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar los talleres';
        this.loading = false;
      },
    });
  }

  cambiarFiltro(f: Filtro): void {
    this.filtro = f;
    this.cargar();
  }

  aprobar(taller: TallerResponse): void {
    this.procesando[taller.id] = 'aprobando';
    this.mensajeFila[taller.id] = { tipo: 'ok', texto: '' };

    this.vehiculoService.aprobarTaller(taller.id).subscribe({
      next: (actualizado) => {
        this.procesando[taller.id] = null;
        this.mensajeFila[taller.id] = { tipo: 'ok', texto: 'Aprobado correctamente' };
        this.reemplazar(actualizado);
        setTimeout(() => this.limpiarMensaje(taller.id), 2500);
      },
      error: (err) => {
        this.procesando[taller.id] = null;
        this.mensajeFila[taller.id] = {
          tipo: 'error',
          texto: err.error?.detail ?? 'Error al aprobar',
        };
      },
    });
  }

  rechazar(taller: TallerResponse): void {
    this.procesando[taller.id] = 'rechazando';

    this.vehiculoService.rechazarTaller(taller.id).subscribe({
      next: (actualizado) => {
        this.procesando[taller.id] = null;
        this.mensajeFila[taller.id] = { tipo: 'ok', texto: 'Rechazado' };
        this.reemplazar(actualizado);
        setTimeout(() => this.limpiarMensaje(taller.id), 2500);
      },
      error: (err) => {
        this.procesando[taller.id] = null;
        this.mensajeFila[taller.id] = {
          tipo: 'error',
          texto: err.error?.detail ?? 'Error al rechazar',
        };
      },
    });
  }

  private reemplazar(actualizado: TallerResponse): void {
    const idx = this.talleres.findIndex((t) => t.id === actualizado.id);
    if (idx !== -1) {
      this.talleres[idx] = actualizado;
      // Si el filtro no es "todos", sacar del listado tras el cambio
      if (this.filtro !== 'todos') {
        setTimeout(() => {
          this.talleres = this.talleres.filter((t) => t.estado === this.filtro);
        }, 1800);
      }
    }
  }

  private limpiarMensaje(id: number): void {
    delete this.mensajeFila[id];
  }

  badgeClass(estado: string): string {
    return {
      pendiente: 'badge-warning',
      aprobado:  'badge-success',
      rechazado: 'badge-danger',
    }[estado] ?? 'badge-warning';
  }
}
