export type AppRole = 'cliente' | 'taller' | 'tecnico' | 'admin';

// Rutas relativas (sin /app/) → roles con acceso
export const ROUTE_ROLES: Record<string, AppRole[]> = {
  // Acceso y Registro
  'acceso-registro/gestionar-vehiculos':        ['cliente'],
  'acceso-registro/registrar-taller':           ['taller'],
  'acceso-registro/gestionar-usuarios':         ['admin'],
  'acceso-registro/aprobar-talleres':           ['admin'],

  // Emergencias
  'emergencias/reportar-emergencia':            ['cliente'],
  'emergencias/enviar-ubicacion':               ['cliente'],
  'emergencias/adjuntar-fotos':                 ['cliente'],
  'emergencias/enviar-audio':                   ['cliente'],

  // Solicitudes
  'solicitudes/ver-solicitudes-disponibles':    ['taller'],
  'solicitudes/ver-estado-solicitud':           ['cliente'],
  'solicitudes/ver-detalle-incidente':          ['taller'],
  'solicitudes/cancelar-solicitud':             ['cliente'],

  // Talleres y Técnicos
  'talleres-tecnicos/gestionar-tecnicos':                ['taller'],
  'talleres-tecnicos/gestionar-disponibilidad':          ['taller'],
  'talleres-tecnicos/actualizar-estado-servicio':        ['taller', 'tecnico'],
  'talleres-tecnicos/registrar-servicio-realizado':      ['taller', 'tecnico'],

  // Cotización y Pagos
  'cotizacion-pagos/generar-cotizacion':        ['taller'],
  'cotizacion-pagos/ver-cotizacion':            ['taller', 'cliente'],
  'cotizacion-pagos/confirmar-cotizacion':      ['taller'],
  'cotizacion-pagos/realizar-pago':             ['cliente'],
  'cotizacion-pagos/ver-comisiones':            ['taller', 'admin'],

  // Comunicación
  'comunicacion/chat':                          ['cliente', 'taller', 'tecnico'],
  'comunicacion/notificaciones':                ['cliente', 'taller'],
  'comunicacion/ver-tecnico-mapa':              ['cliente'],

  // Reportes
  'reportes/historial-servicios':               ['cliente', 'taller'],
  'reportes/calificar-servicio':                ['cliente'],
  'reportes/metricas-taller':                   ['taller'],
  'reportes/metricas-globales':                 ['admin'],
  'reportes/auditoria':                         ['admin'],
};

export function canAccessRoute(relativePath: string, role: AppRole): boolean {
  const allowed = ROUTE_ROLES[relativePath];
  if (!allowed) return true;
  return allowed.includes(role);
}
