import { Routes } from '@angular/router';
import { IniciarSesionComponent } from './acceso-registro/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './acceso-registro/registrarse/registrarse.component';
import { AppLayoutComponent } from './shared/layout/app-layout.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { RegistrarTallerComponent } from './acceso-registro/registrar-taller/registrar-taller.component';
import { AprobarTalleresComponent } from './acceso-registro/aprobar-talleres/aprobar-talleres.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '',       redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',  component: IniciarSesionComponent },
  { path: 'registro', component: RegistrarseComponent },

  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },

      // ── Acceso y Registro ──────────────────────
      { path: 'acceso-registro/registrar-taller',     component: RegistrarTallerComponent },

      // Stubs — se implementarán en ciclos siguientes
      { path: 'acceso-registro/gestionar-vehiculos',  component: DashboardHomeComponent },
      { path: 'acceso-registro/gestionar-usuarios',   component: DashboardHomeComponent },
      { path: 'acceso-registro/aprobar-talleres',     component: AprobarTalleresComponent },
      { path: 'emergencias/:cu',                      component: DashboardHomeComponent },
      { path: 'solicitudes/:cu',                      component: DashboardHomeComponent },
      { path: 'talleres-tecnicos/:cu',                component: DashboardHomeComponent },
      { path: 'cotizacion-pagos/:cu',                 component: DashboardHomeComponent },
      { path: 'comunicacion/:cu',                     component: DashboardHomeComponent },
      { path: 'reportes/:cu',                         component: DashboardHomeComponent },
    ],
  },

  // Compatibilidad con redirect antiguo
  { path: 'dashboard', redirectTo: 'app/dashboard', pathMatch: 'full' },
];
