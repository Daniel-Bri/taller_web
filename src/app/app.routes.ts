import { Routes } from '@angular/router';
import { IniciarSesionComponent } from './acceso-registro/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './acceso-registro/registrarse/registrarse.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '',          redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',     component: IniciarSesionComponent },
  { path: 'registro',  component: RegistrarseComponent },
  { path: 'dashboard', component: DashboardComponent },
];
