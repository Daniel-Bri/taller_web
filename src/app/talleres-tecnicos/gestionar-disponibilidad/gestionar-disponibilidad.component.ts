import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TecnicoService, TallerInfoResponse } from '../tecnico.service';

@Component({
  selector: 'app-gestionar-disponibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-disponibilidad.component.html',
})
export class GestionarDisponibilidadComponent implements OnInit {

  taller: TallerInfoResponse | null = null;
  disponibleSeleccionado = false;

  loading    = false;
  guardando  = false;
  errorMsg   = '';
  successMsg = '';

  constructor(private svc: TecnicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.svc.getMiTaller().subscribe({
      next: (data) => {
        this.taller                 = data;
        this.disponibleSeleccionado = data.disponible;
        this.loading                = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar información del taller';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambioSinGuardar(): boolean {
    return this.taller !== null && this.disponibleSeleccionado !== this.taller.disponible;
  }

  guardar(): void {
    this.guardando  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.svc.actualizarDisponibilidad(this.disponibleSeleccionado).subscribe({
      next: (data) => {
        this.taller                 = data;
        this.disponibleSeleccionado = data.disponible;
        this.successMsg             = `Disponibilidad actualizada: taller marcado como ${data.disponible ? 'Disponible' : 'No disponible'}`;
        this.guardando              = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3500);
      },
      error: (err) => {
        this.errorMsg  = err.error?.detail ?? 'Error al actualizar la disponibilidad';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleDisponible(): void {
    this.disponibleSeleccionado = !this.disponibleSeleccionado;
  }

  estadoBadge(estado: string): string {
    return { aprobado: 'badge-success', pendiente: 'badge-warning', rechazado: 'badge-danger' }[estado] ?? 'badge-muted';
  }
}
