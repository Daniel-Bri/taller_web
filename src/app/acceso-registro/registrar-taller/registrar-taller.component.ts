import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VehiculoService } from '../vehiculo.service';

@Component({
  selector: 'app-registrar-taller',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registrar-taller.component.html',
})
export class RegistrarTallerComponent {
  form: FormGroup;
  loading = false;
  serverError = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      nombre:          ['', [Validators.required, Validators.minLength(3)]],
      direccion:       ['', Validators.required],
      telefono:        [''],
      email_comercial: [''],
      latitud:         [''],
      longitud:        [''],
    });
  }

  get nombre()          { return this.form.get('nombre')!; }
  get direccion()       { return this.form.get('direccion')!; }
  get email_comercial() { return this.form.get('email_comercial')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';

    const payload = {
      ...this.form.value,
      latitud:  this.form.value.latitud  ? parseFloat(this.form.value.latitud)  : null,
      longitud: this.form.value.longitud ? parseFloat(this.form.value.longitud) : null,
    };

    this.vehiculoService.registrarTaller(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Taller registrado. Pendiente de aprobación por el administrador.';
      },
      error: (err) => {
        this.serverError = err.error?.detail ?? 'Error al registrar el taller';
        this.loading = false;
      },
    });
  }
}
