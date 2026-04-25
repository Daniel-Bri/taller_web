import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculoService, UserDetailResponse, UserPayload } from '../vehiculo.service';

type RoleFiltro = 'todos' | 'cliente' | 'taller' | 'tecnico' | 'admin';
type ActiveFiltro = 'todos' | 'activo' | 'inactivo';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-usuarios.component.html',
})
export class GestionarUsuariosComponent implements OnInit {
  usuarios: UserDetailResponse[] = [];
  loading = false;
  errorMsg = '';

  // Filtros
  roleFiltro: RoleFiltro = 'todos';
  activeFiltro: ActiveFiltro = 'todos';
  search = '';
  page = 1;
  size = 20;
  total = 0;
  pages = 1;

  // Edición
  editando: UserDetailResponse | null = null;
  editForm: UserPayload = {};
  guardando = false;
  editError = '';
  editOk = '';

  // Acciones por fila
  procesando: Record<number, boolean> = {};
  mensajeFila: Record<number, { tipo: 'ok' | 'error'; texto: string }> = {};

  readonly roles: { value: RoleFiltro; label: string }[] = [
    { value: 'todos', label: 'Todos los roles' },
    { value: 'cliente', label: 'Clientes' },
    { value: 'taller', label: 'Talleres' },
    { value: 'tecnico', label: 'Técnicos' },
    { value: 'admin', label: 'Administradores' },
  ];

  readonly roleLabels: Record<string, string> = {
    cliente: 'Cliente', taller: 'Taller', tecnico: 'Técnico', admin: 'Admin',
  };

  constructor(private svc: VehiculoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    const params: Record<string, unknown> = { page: this.page, size: this.size };
    if (this.roleFiltro !== 'todos') params['role'] = this.roleFiltro;
    if (this.activeFiltro !== 'todos') params['activo'] = this.activeFiltro === 'activo';
    if (this.search.trim()) params['search'] = this.search.trim();

    this.svc.listarUsuarios(params as Parameters<typeof this.svc.listarUsuarios>[0]).subscribe({
      next: (res) => {
        this.usuarios = res.items;
        this.total = res.total;
        this.pages = res.pages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.name === 'TimeoutError'
          ? 'El servidor no responde.'
          : (err.error?.detail ?? 'Error al cargar usuarios');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void { this.page = 1; this.cargar(); }
  cambiarPagina(p: number): void { this.page = p; this.cargar(); }

  abrirEdicion(u: UserDetailResponse): void {
    this.editando = { ...u };
    this.editForm = {
      full_name: u.full_name ?? '',
      telefono: u.telefono ?? '',
      email: u.email,
      role: u.role,
    };
    this.editError = '';
    this.editOk = '';
  }

  cerrarEdicion(): void { this.editando = null; }

  guardar(): void {
    if (!this.editando) return;
    this.guardando = true;
    this.editError = '';
    this.editOk = '';
    const payload: UserPayload = {};
    if (this.editForm.full_name !== undefined) payload.full_name = this.editForm.full_name;
    if (this.editForm.telefono !== undefined) payload.telefono = this.editForm.telefono;
    if (this.editForm.email !== undefined) payload.email = this.editForm.email;
    if (this.editForm.role !== undefined) payload.role = this.editForm.role;

    this.svc.actualizarUsuario(this.editando.id, payload).subscribe({
      next: (actualizado) => {
        this.editOk = 'Cambios guardados correctamente';
        this.guardando = false;
        const idx = this.usuarios.findIndex(u => u.id === actualizado.id);
        if (idx !== -1) this.usuarios[idx] = actualizado;
        this.editando = actualizado;
        this.cdr.detectChanges();
        setTimeout(() => { this.editOk = ''; this.cdr.detectChanges(); }, 2500);
      },
      error: (err) => {
        this.editError = err.error?.detail ?? 'Error al guardar cambios';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActivo(u: UserDetailResponse): void {
    this.procesando[u.id] = true;
    const obs = u.is_active ? this.svc.desactivarUsuario(u.id) : this.svc.activarUsuario(u.id);
    obs.subscribe({
      next: (actualizado) => {
        this.procesando[u.id] = false;
        const msg = actualizado.is_active ? 'Cuenta activada' : 'Cuenta desactivada';
        this.mensajeFila[u.id] = { tipo: 'ok', texto: msg };
        const idx = this.usuarios.findIndex(x => x.id === actualizado.id);
        if (idx !== -1) this.usuarios[idx] = actualizado;
        if (this.editando?.id === actualizado.id) this.editando = actualizado;
        this.cdr.detectChanges();
        setTimeout(() => { delete this.mensajeFila[u.id]; this.cdr.detectChanges(); }, 2500);
      },
      error: (err) => {
        this.procesando[u.id] = false;
        this.mensajeFila[u.id] = { tipo: 'error', texto: err.error?.detail ?? 'Error' };
        this.cdr.detectChanges();
      },
    });
  }

  badgeRole(role: string): string {
    return { admin: 'badge-danger', taller: 'badge-warning', tecnico: 'badge-primary', cliente: 'badge-muted' }[role] ?? 'badge-muted';
  }

  trackById(_: number, u: UserDetailResponse) { return u.id; }
}
