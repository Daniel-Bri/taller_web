import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { timeout } from 'rxjs';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const np = group.get('new_password')?.value;
  const cp = group.get('confirm_password')?.value;
  return np && cp && np !== cp ? { mismatch: true } : null;
}

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './recuperar-contrasena.component.html',
})
export class RecuperarContrasenaComponent {
  // Paso 1: pedir email
  emailForm: FormGroup;
  // Paso 2: código + nueva contraseña
  resetForm: FormGroup;

  step: 1 | 2 = 1;
  emailEnviado = '';
  loading = false;
  serverError = '';
  success = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.resetForm = this.fb.group({
      code:             ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      new_password:     ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    }, { validators: passwordsMatch });
  }

  get email()   { return this.emailForm.get('email')!; }
  get code()    { return this.resetForm.get('code')!; }
  get newPw()   { return this.resetForm.get('new_password')!; }
  get confirm() { return this.resetForm.get('confirm_password')!; }

  // ── Paso 1: enviar código ──────────────────────────────────
  submitEmail(): void {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';
    this.auth.requestReset(this.email.value)
      .pipe(timeout(12000))
      .subscribe({
        next: () => {
          this.emailEnviado = this.email.value;
          this.step = 2;
          this.loading = false;
        },
        error: (err) => {
          this.serverError = err.error?.detail ?? 'No se pudo enviar el correo';
          this.loading = false;
        },
      });
  }

  // ── Paso 2: verificar código y resetear ───────────────────
  submitReset(): void {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';
    this.auth.resetPassword(this.emailEnviado, this.code.value, this.newPw.value)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 2500);
        },
        error: (err) => {
          this.serverError = err.error?.detail ?? 'Código inválido o expirado';
          this.loading = false;
        },
      });
  }

  volverPaso1(): void {
    this.step = 1;
    this.serverError = '';
    this.resetForm.reset();
  }
}
