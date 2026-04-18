import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TecnicoService,
  AsignacionResponse,
  RepuestoItem,
  ServicioRealizadoResponse,
} from '../tecnico.service';

interface FormServicio {
  descripcion_trabajo: string;
  repuestos: RepuestoItem[];
  observaciones: string;
}

@Component({
  selector: 'app-registrar-servicio-realizado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-servicio-realizado.component.html',
})
export class RegistrarServicioRealizadoComponent implements OnInit {

  // ── Asignaciones listas para cierre ────────────────────
  asignaciones: AsignacionResponse[] = [];
  loadingListas = false;
  errorListas   = '';

  // ── Panel de registro activo ────────────────────────────
  asignacionActiva: AsignacionResponse | null = null;
  form: FormServicio = { descripcion_trabajo: '', repuestos: [], observaciones: '' };

  guardando  = false;
  formError  = '';
  formSuccess = '';

  // ── Historial ───────────────────────────────────────────
  historial: ServicioRealizadoResponse[] = [];
  loadingHistorial = false;
  mostrarHistorial = false;

  constructor(private svc: TecnicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargarListas(); }

  cargarListas(): void {
    this.loadingListas = true;
    this.errorListas   = '';
    this.svc.listarAsignacionesListas().subscribe({
      next: (data) => { this.asignaciones = data; this.loadingListas = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorListas   = err.error?.detail ?? 'Error al cargar asignaciones';
        this.loadingListas = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirFormulario(a: AsignacionResponse): void {
    this.asignacionActiva = a;
    this.form = { descripcion_trabajo: '', repuestos: [], observaciones: '' };
    this.formError   = '';
    this.formSuccess = '';
  }

  cerrarFormulario(): void { this.asignacionActiva = null; }

  agregarRepuesto(): void {
    this.form.repuestos = [...this.form.repuestos, { descripcion: '', cantidad: 1 }];
  }

  eliminarRepuesto(i: number): void {
    this.form.repuestos = this.form.repuestos.filter((_, idx) => idx !== i);
  }

  get formValido(): boolean {
    return this.form.descripcion_trabajo.trim().length >= 5;
  }

  guardar(): void {
    if (!this.formValido) { this.formError = 'La descripción del trabajo es obligatoria (mínimo 5 caracteres)'; return; }
    this.guardando = true;
    this.formError = '';

    const repuestosValidos = this.form.repuestos.filter((r) => r.descripcion.trim() && r.cantidad > 0);

    this.svc.registrarServicio({
      asignacion_id:       this.asignacionActiva!.id,
      descripcion_trabajo: this.form.descripcion_trabajo.trim(),
      repuestos:           repuestosValidos.length ? repuestosValidos : undefined,
      observaciones:       this.form.observaciones.trim() || undefined,
    }).subscribe({
      next: () => {
        this.formSuccess = 'Servicio registrado y cerrado correctamente.';
        this.asignaciones = this.asignaciones.filter((a) => a.id !== this.asignacionActiva!.id);
        this.guardando    = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.asignacionActiva = null; this.cdr.detectChanges(); }, 2000);
      },
      error: (err) => {
        this.formError = err.error?.detail ?? 'Error al registrar el servicio';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  verHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
    if (this.mostrarHistorial && this.historial.length === 0) {
      this.loadingHistorial = true;
      this.svc.listarServiciosRealizados().subscribe({
        next: (data) => { this.historial = data; this.loadingHistorial = false; this.cdr.detectChanges(); },
        error: () => { this.loadingHistorial = false; this.cdr.detectChanges(); },
      });
    }
  }

  parsearRepuestos(raw: string | null): RepuestoItem[] {
    return this.svc.parsearRepuestos(raw);
  }
}
