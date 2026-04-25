import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../acceso-registro/auth.service';

interface NavItem    { label: string; route: string; roles?: string[]; }
interface NavSection { id: string; label: string; icon: string; items: NavItem[]; roles?: string[]; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent {
  collapsed = signal(false);
  openSections = new Set<string>(['acceso']);

  private readonly ALL_NAV_SECTIONS: NavSection[] = [
    {
      id: 'acceso',
      label: 'Acceso y Registro',
      icon: 'manage_accounts',
      items: [
        { label: 'Mis Vehículos',      route: '/app/acceso-registro/gestionar-vehiculos',  roles: ['cliente'] },
        { label: 'Registrar Taller',   route: '/app/acceso-registro/registrar-taller',     roles: ['cliente'] },
        { label: 'Gestionar Usuarios', route: '/app/acceso-registro/gestionar-usuarios',   roles: ['admin'] },
        { label: 'Aprobar Talleres',   route: '/app/acceso-registro/aprobar-talleres',     roles: ['admin'] },
      ],
    },
    {
      id: 'emergencias',
      label: 'Emergencias',
      icon: 'emergency',
      roles: ['cliente'],
      items: [
        { label: 'Reportar Emergencia', route: '/app/emergencias/reportar-emergencia' },
        { label: 'Enviar Ubicación',    route: '/app/emergencias/enviar-ubicacion' },
        { label: 'Adjuntar Fotos',      route: '/app/emergencias/adjuntar-fotos' },
      ],
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes',
      icon: 'assignment',
      items: [
        { label: 'Ver Disponibles',   route: '/app/solicitudes/ver-solicitudes-disponibles', roles: ['taller'] },
        { label: 'Ver Estado',        route: '/app/solicitudes/ver-estado-solicitud',        roles: ['cliente'] },
        { label: 'Detalle Incidente', route: '/app/solicitudes/ver-detalle-incidente',       roles: ['taller'] },
      ],
    },
    {
      id: 'talleres',
      label: 'Talleres y Técnicos',
      icon: 'handyman',
      roles: ['taller', 'tecnico'],
      items: [
        { label: 'Gestionar Técnicos',       route: '/app/talleres-tecnicos/gestionar-tecnicos',          roles: ['taller'] },
        { label: 'Gestionar Disponibilidad', route: '/app/talleres-tecnicos/gestionar-disponibilidad',    roles: ['taller'] },
        { label: 'Actualizar Estado',        route: '/app/talleres-tecnicos/actualizar-estado-servicio',  roles: ['taller', 'tecnico'] },
        { label: 'Registrar Servicio',       route: '/app/talleres-tecnicos/registrar-servicio-realizado', roles: ['taller', 'tecnico'] },
      ],
    },
    {
      id: 'pagos',
      label: 'Cotización y Pagos',
      icon: 'receipt_long',
      items: [
        { label: 'Generar Cotización',   route: '/app/cotizacion-pagos/generar-cotizacion',   roles: ['taller'] },
        { label: 'Ver Cotizaciones',     route: '/app/cotizacion-pagos/ver-cotizacion',       roles: ['taller', 'cliente'] },
        { label: 'Realizar Pago',        route: '/app/cotizacion-pagos/realizar-pago',        roles: ['cliente'] },
        { label: 'Ver Comisiones',       route: '/app/cotizacion-pagos/ver-comisiones',       roles: ['taller', 'admin'] },
      ],
    },
    {
      id: 'comunicacion',
      label: 'Comunicación',
      icon: 'forum',
      items: [
        { label: 'Chat',             route: '/app/comunicacion/chat' },
        { label: 'Notificaciones',   route: '/app/comunicacion/notificaciones' },
        { label: 'Técnico en Mapa',  route: '/app/comunicacion/ver-tecnico-mapa', roles: ['cliente'] },
      ],
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'analytics',
      items: [
        { label: 'Historial',         route: '/app/reportes/historial-servicios',  roles: ['taller', 'cliente', 'tecnico'] },
        { label: 'Métricas Taller',   route: '/app/reportes/metricas-taller',      roles: ['taller'] },
        { label: 'Métricas Globales', route: '/app/reportes/metricas-globales',    roles: ['admin'] },
        { label: 'Auditoría',         route: '/app/reportes/auditoria',            roles: ['admin'] },
      ],
    },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  get user()       { return this.auth.getUser(); }
  get userRole()   { return this.user?.role ?? 'cliente'; }
  get userInitial(){ return (this.user?.username ?? 'U')[0].toUpperCase(); }
  get userName()   { return this.user?.full_name || this.user?.username || 'Usuario'; }

  get userRoleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador', taller: 'Taller', tecnico: 'Técnico', cliente: 'Cliente',
    };
    return labels[this.userRole] ?? 'Usuario';
  }

  get navSections(): NavSection[] {
    const role = this.userRole;
    return this.ALL_NAV_SECTIONS
      .filter(s => !s.roles || s.roles.includes(role))
      .map(s => ({
        ...s,
        items: s.items.filter(i => !i.roles || i.roles.includes(role)),
      }))
      .filter(s => s.items.length > 0);
  }

  toggle()             { this.collapsed.update(v => !v); }
  toggleSection(id: string) {
    this.openSections.has(id) ? this.openSections.delete(id) : this.openSections.add(id);
  }
  isOpen(id: string)   { return this.openSections.has(id); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
