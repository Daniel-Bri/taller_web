import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../acceso-registro/auth.service';
import { Notificacion, NotificacionService } from '../../comunicacion/notificacion.service';

interface NavItem  { label: string; route: string; }
interface NavSection {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  collapsed = signal(false);
  openSections = new Set<string>(['acceso']);

  navSections: NavSection[] = [
    {
      id: 'acceso',
      label: 'Acceso y Registro',
      icon: 'manage_accounts',
      items: [
        { label: 'Mis Vehículos',      route: '/app/acceso-registro/gestionar-vehiculos' },
        { label: 'Registrar Taller',   route: '/app/acceso-registro/registrar-taller' },
        { label: 'Gestionar Usuarios', route: '/app/acceso-registro/gestionar-usuarios' },
        { label: 'Aprobar Talleres',   route: '/app/acceso-registro/aprobar-talleres' },
      ],
    },
    {
      id: 'emergencias',
      label: 'Emergencias',
      icon: 'emergency',
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
        { label: 'Ver Disponibles',   route: '/app/solicitudes/ver-solicitudes-disponibles' },
        { label: 'Ver Estado',        route: '/app/solicitudes/ver-estado-solicitud' },
        { label: 'Detalle Incidente', route: '/app/solicitudes/ver-detalle-incidente' },
      ],
    },
    {
      id: 'talleres',
      label: 'Talleres y Técnicos',
      icon: 'handyman',
      items: [
        { label: 'Gestionar Técnicos',       route: '/app/talleres-tecnicos/gestionar-tecnicos' },
        { label: 'Gestionar Disponibilidad', route: '/app/talleres-tecnicos/gestionar-disponibilidad' },
        { label: 'Actualizar Estado',        route: '/app/talleres-tecnicos/actualizar-estado-servicio' },
        { label: 'Registrar Servicio',       route: '/app/talleres-tecnicos/registrar-servicio-realizado' },
      ],
    },
    {
      id: 'pagos',
      label: 'Cotización y Pagos',
      icon: 'receipt_long',
      items: [
        { label: 'Generar Cotización',   route: '/app/cotizacion-pagos/generar-cotizacion' },
        { label: 'Ver Cotizaciones',     route: '/app/cotizacion-pagos/ver-cotizacion' },
        { label: 'Realizar Pago',        route: '/app/cotizacion-pagos/realizar-pago' },
        { label: 'Ver Comisiones',       route: '/app/cotizacion-pagos/ver-comisiones' },
      ],
    },
    {
      id: 'comunicacion',
      label: 'Comunicación',
      icon: 'forum',
      items: [
        { label: 'Chat',             route: '/app/comunicacion/chat' },
        { label: 'Notificaciones',   route: '/app/comunicacion/notificaciones' },
        { label: 'Técnico en Mapa',  route: '/app/comunicacion/ver-tecnico-mapa' },
      ],
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'analytics',
      items: [
        { label: 'Historial',         route: '/app/reportes/historial-servicios' },
        { label: 'Métricas Taller',   route: '/app/reportes/metricas-taller' },
        { label: 'Métricas Globales', route: '/app/reportes/metricas-globales' },
        { label: 'Auditoría',         route: '/app/reportes/auditoria' },
      ],
    },
  ];

  notifs: Notificacion[] = [];
  notifOpen = false;
  notifLoading = false;
  private _poll?: ReturnType<typeof setInterval>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifSvc: NotificacionService,
  ) {}

  ngOnInit(): void {
    this.cargarNotifs();
    this._poll = setInterval(() => this.cargarNotifs(true), 20000);
  }

  ngOnDestroy(): void {
    if (this._poll) clearInterval(this._poll);
  }

  get user() { return this.auth.getUser(); }
  get userInitial() { return (this.user?.username ?? 'U')[0].toUpperCase(); }
  get userName()    { return this.user?.full_name || this.user?.username || 'Usuario'; }
  get userRole(): string {
    const labels: Record<string, string> = {
      admin:   'Administrador',
      taller:  'Taller',
      tecnico: 'Técnico',
      cliente: 'Cliente',
    };
    return labels[this.user?.role ?? 'cliente'] ?? 'Usuario';
  }

  toggle() { this.collapsed.update(v => !v); }

  toggleSection(id: string) {
    this.openSections.has(id) ? this.openSections.delete(id) : this.openSections.add(id);
  }

  isOpen(id: string) { return this.openSections.has(id); }

  get notifNoLeidas(): number {
    return this.notifs.filter((n) => !n.leida).length;
  }

  toggleNotifs(): void {
    this.notifOpen = !this.notifOpen;
  }

  cargarNotifs(silent = false): void {
    if (!silent) this.notifLoading = true;
    this.notifSvc.listarMias().subscribe({
      next: (rows) => {
        this.notifs = rows.slice(0, 12);
        this.notifLoading = false;
      },
      error: () => {
        this.notifLoading = false;
      },
    });
  }

  marcarLeida(n: Notificacion): void {
    if (n.leida) return;
    this.notifSvc.marcarLeida(n.id).subscribe({
      next: () => { n.leida = true; },
      error: () => {},
    });
  }

  notifTipoClase(n: Notificacion): string {
    const t = (n.tipo || '').toLowerCase();
    if (t.includes('cancel') || t.includes('rechaz')) return 'negativa';
    if (t.includes('acept') || t.includes('resuelto') || t.includes('solucion')) return 'positiva';
    return 'neutra';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
