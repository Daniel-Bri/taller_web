import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, CalificacionPendienteItem } from '../reportes.service';

@Component({
  selector: 'app-calificar-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificar-servicio.component.html',
})
export class CalificarServicioComponent implements OnInit {
  pendientes: CalificacionPendienteItem[] = [];
  loading = false;
  errorMsg = '';
  okMsg = '';
  puntuacion = 5;
  resena = '';
  seleccion: CalificacionPendienteItem | null = null;

  constructor(private reportes: ReportesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    this.okMsg = '';
    this.reportes.pendientesCalificacion().subscribe({
      next: (rows) => {
        this.pendientes = rows;
        this.seleccion = rows[0] ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'No se pudo cargar servicios pendientes de calificación';
        this.loading = false;
      },
    });
  }

  enviar(): void {
    if (!this.seleccion) return;
    this.reportes.calificar({
      asignacion_id: this.seleccion.asignacion_id,
      puntuacion: this.puntuacion,
      resena: this.resena.trim() || undefined,
    }).subscribe({
      next: () => {
        this.okMsg = '¡Gracias! Calificación registrada.';
        this.resena = '';
        this.puntuacion = 5;
        this.cargar();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'No se pudo registrar la calificación';
      },
    });
  }
}
