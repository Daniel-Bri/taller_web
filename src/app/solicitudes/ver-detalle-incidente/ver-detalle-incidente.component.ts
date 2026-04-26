import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TecnicoService, AsignacionResponse } from '../../talleres-tecnicos/tecnico.service';

const ESTADO_INFO: Record<string, { label: string; badge: string }> = {
  aceptado:      { label: 'Aceptado',      badge: 'badge-warning' },
  en_camino:     { label: 'En camino',     badge: 'badge-primary' },
  en_sitio:      { label: 'En sitio',      badge: 'badge-purple' },
  en_reparacion: { label: 'En reparación', badge: 'badge-orange' },
  finalizado:    { label: 'Finalizado',    badge: 'badge-success' },
  cancelado:     { label: 'Cancelado',     badge: 'badge-danger' },
};

@Component({
  selector: 'app-ver-detalle-incidente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-detalle-incidente.component.html',
})
export class VerDetalleIncidenteComponent implements OnInit {
  asignaciones: AsignacionResponse[] = [];
  loading = false;
  errorMsg = '';
  seleccion: AsignacionResponse | null = null;

  constructor(private svc: TecnicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    this.svc.listarActivas().subscribe({
      next: (data) => {
        this.asignaciones = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar incidentes';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  info(estado: string): { label: string; badge: string } {
    return ESTADO_INFO[estado] ?? { label: estado, badge: 'badge-muted' };
  }

  seleccionar(a: AsignacionResponse): void { this.seleccion = a; }
  cerrar(): void { this.seleccion = null; }
}
