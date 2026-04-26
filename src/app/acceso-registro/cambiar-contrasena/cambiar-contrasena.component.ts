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
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './cambiar-contrasena.component.html',
})
export class CambiarContrasenaComponent {
  form: FormGroup;
  loading = false;
  serverError = '';
  success = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password:     ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    }, { validators: passwordsMatch });
  }

  get current() { return this.form.get('current_password')!; }
  get newPw()   { return this.form.get('new_password')!; }
  get confirm() { return this.form.get('confirm_password')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';
    this.auth.changePassword(this.current.value, this.newPw.value)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err) => {
          this.serverError = err.error?.detail ?? 'Error al cambiar la contraseña';
          this.loading = false;
        },
      });
  }
}
