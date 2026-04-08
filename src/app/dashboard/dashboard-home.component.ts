import { Component } from '@angular/core';
import { AuthService } from '../acceso-registro/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-sub">Bienvenido, <strong>{{ userName }}</strong></p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#EFF6FF;color:var(--primary)">
          <span class="material-symbols-outlined">crisis_alert</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">0</span>
          <span class="stat-label">Incidentes activos</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ECFDF5;color:var(--success)">
          <span class="material-symbols-outlined">verified</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">0</span>
          <span class="stat-label">Talleres aprobados</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#FEF2F2;color:var(--danger)">
          <span class="material-symbols-outlined">pending_actions</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">0</span>
          <span class="stat-label">Solicitudes pendientes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#F5F3FF;color:#7C3AED">
          <span class="material-symbols-outlined">payments</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">$0</span>
          <span class="stat-label">Pagos del mes</span>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <h2 class="section-title">Accesos rápidos</h2>
    <div class="quick-grid">
      <a routerLink="/app/acceso-registro/gestionar-vehiculos" class="quick-card">
        <div class="quick-icon" style="background:#EFF6FF;color:var(--primary)">
          <span class="material-symbols-outlined">directions_car</span>
        </div>
        <span class="quick-label">Mis Vehículos</span>
      </a>
      <a routerLink="/app/acceso-registro/registrar-taller" class="quick-card">
        <div class="quick-icon" style="background:#ECFDF5;color:var(--success)">
          <span class="material-symbols-outlined">store</span>
        </div>
        <span class="quick-label">Registrar Taller</span>
      </a>
      <a routerLink="/app/solicitudes/ver-solicitudes-disponibles" class="quick-card">
        <div class="quick-icon" style="background:#EFF6FF;color:var(--secondary)">
          <span class="material-symbols-outlined">assignment</span>
        </div>
        <span class="quick-label">Ver Solicitudes</span>
      </a>
      <a routerLink="/app/reportes/historial-servicios" class="quick-card">
        <div class="quick-icon" style="background:#F5F3FF;color:#7C3AED">
          <span class="material-symbols-outlined">history</span>
        </div>
        <span class="quick-label">Historial</span>
      </a>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-title  { font-size: 1.5rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
    .page-sub    { color: #6B7280; font-size: 0.9rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 8px rgba(0,0,0,0.05);
    }
    .stat-icon {
      width: 46px; height: 46px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text); display: block; line-height: 1.2; }
    .stat-label { font-size: 0.78rem; color: #6B7280; margin-top: 2px; }

    .section-title { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; letter-spacing: 0.02em; text-transform: uppercase; }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
    .quick-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem 1rem;
      display: flex; flex-direction: column;
      align-items: center; gap: 0.75rem;
      text-decoration: none;
      box-shadow: 0 1px 8px rgba(0,0,0,0.05);
      border: 1px solid #F3F4F6;
      transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
    }
    .quick-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.1); transform: translateY(-2px); border-color: #DBEAFE; }
    .quick-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .quick-label { font-size: 0.83rem; font-weight: 600; color: var(--text); text-align: center; }
  `],
})
export class DashboardHomeComponent {
  constructor(private auth: AuthService) {}
  get userName() { return this.auth.getUser()?.full_name || this.auth.getUser()?.username || 'Usuario'; }
}
