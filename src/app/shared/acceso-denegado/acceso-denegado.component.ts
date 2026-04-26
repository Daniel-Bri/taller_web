import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  template: `
    <div class="denied-wrap">
      <div class="denied-card">
        <span class="material-symbols-outlined denied-icon">lock</span>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.<br>Contacta con el administrador si crees que es un error.</p>
        <button class="btn-back" (click)="goBack()">
          <span class="material-symbols-outlined" style="font-size:16px">arrow_back</span>
          Volver
        </button>
      </div>
    </div>
  `,
  styles: [`
    .denied-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 65vh;
    }
    .denied-card {
      text-align: center;
      padding: 3rem 2.5rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      max-width: 400px;
      width: 100%;
    }
    .denied-icon {
      font-size: 72px;
      color: #EF4444;
      font-variation-settings: 'FILL' 0, 'wght' 300;
      display: block;
      margin-bottom: 1.2rem;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.6rem;
    }
    p {
      color: #6B7280;
      font-size: 0.88rem;
      line-height: 1.6;
      margin: 0 0 1.8rem;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 1.5rem;
      background: #2563EB;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-back:hover { background: #1D4ED8; }
  `],
})
export class AccesoDenegadoComponent {
  constructor(private location: Location, private router: Router) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/app/dashboard']);
    }
  }
}
