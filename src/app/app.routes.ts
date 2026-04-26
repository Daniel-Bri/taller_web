import { Routes } from '@angular/router';
import { IniciarSesionComponent } from './acceso-registro/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './acceso-registro/registrarse/registrarse.component';
import { AppLayoutComponent } from './shared/layout/app-layout.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { RegistrarTallerComponent } from './acceso-registro/registrar-taller/registrar-taller.component';
import { AprobarTalleresComponent } from './acceso-registro/aprobar-talleres/aprobar-talleres.component';
import { GestionarTecnicosComponent } from './talleres-tecnicos/gestionar-tecnicos/gestionar-tecnicos.component';
import { GestionarDisponibilidadComponent } from './talleres-tecnicos/gestionar-disponibilidad/gestionar-disponibilidad.component';
import { ActualizarEstadoServicioComponent } from './talleres-tecnicos/actualizar-estado-servicio/actualizar-estado-servicio.component';
import { RegistrarServicioRealizadoComponent } from './talleres-tecnicos/registrar-servicio-realizado/registrar-servicio-realizado.component';
import { GenerarCotizacionComponent } from './cotizacion-pagos/generar-cotizacion/generar-cotizacion.component';
import { VerCotizacionComponent } from './cotizacion-pagos/ver-cotizacion/ver-cotizacion.component';
import { ConfirmarCotizacionComponent } from './cotizacion-pagos/confirmar-cotizacion/confirmar-cotizacion.component';
import { ChatComponent } from './comunicacion/chat/chat.component';
import { AdjuntarFotosComponent } from './emergencias/adjuntar-fotos/adjuntar-fotos.component';
import { EnviarAudioComponent } from './emergencias/enviar-audio/enviar-audio.component';
import { VerSolicitudesDisponiblesComponent } from './solicitudes/ver-solicitudes-disponibles/ver-solicitudes-disponibles.component';
import { VerEstadoSolicitudComponent } from './solicitudes/ver-estado-solicitud/ver-estado-solicitud.component';
import { VerDetalleIncidenteComponent } from './solicitudes/ver-detalle-incidente/ver-detalle-incidente.component';
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

      // ── Acceso admin ───────────────────────────────────
      { path: 'acceso-registro/gestionar-vehiculos',  component: DashboardHomeComponent },
      { path: 'acceso-registro/gestionar-usuarios',   component: DashboardHomeComponent },
      { path: 'acceso-registro/aprobar-talleres',     component: AprobarTalleresComponent },

      // ── CU15 · Actualizar Estado Servicio ───────────
      { path: 'talleres-tecnicos/actualizar-estado-servicio',   component: ActualizarEstadoServicioComponent },

      // ── CU22 · Registrar Servicio Realizado ──────────
      { path: 'talleres-tecnicos/registrar-servicio-realizado', component: RegistrarServicioRealizadoComponent },

      // ── CU25 · Gestionar Técnicos ───────────────────
      { path: 'talleres-tecnicos/gestionar-tecnicos',      component: GestionarTecnicosComponent },

      // ── CU16 · Gestionar Disponibilidad ─────────────
      { path: 'talleres-tecnicos/gestionar-disponibilidad', component: GestionarDisponibilidadComponent },

      // ── CU20 · Gestionar Cotización ─────────────────
      { path: 'cotizacion-pagos/generar-cotizacion',  component: GenerarCotizacionComponent },
      { path: 'cotizacion-pagos/ver-cotizacion',      component: VerCotizacionComponent },
      { path: 'cotizacion-pagos/confirmar-cotizacion', component: ConfirmarCotizacionComponent },

      // ── CU18 · Chat ──────────────────────────────────
      { path: 'comunicacion/chat',                    component: ChatComponent },

      // ── CU07 · Adjuntar Fotos ────────────────────────
      { path: 'emergencias/adjuntar-fotos',           component: AdjuntarFotosComponent },

      // ── CU08 · Enviar Audio ──────────────────────────
      { path: 'emergencias/enviar-audio',             component: EnviarAudioComponent },

      // ── CU13 · Ver Solicitudes Disponibles ───────────
      { path: 'solicitudes/ver-solicitudes-disponibles', component: VerSolicitudesDisponiblesComponent },

      // ── CU10 · Ver Estado de Solicitud ───────────────
      { path: 'solicitudes/ver-estado-solicitud',     component: VerEstadoSolicitudComponent },
      { path: 'solicitudes/ver-detalle-incidente',    component: VerDetalleIncidenteComponent },

      // ── Stubs restantes ─────────────────────────────
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
