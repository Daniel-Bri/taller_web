import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  ChangeDetectorRef, AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, switchMap, catchError, of } from 'rxjs';

import { AuthService } from '../../acceso-registro/auth.service';
import { TecnicoService, AsignacionResponse } from '../../talleres-tecnicos/tecnico.service';
import { ComunicacionService, MensajeResponse } from '../comunicacion.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  asignaciones: AsignacionResponse[] = [];
  asignacionSeleccionada: AsignacionResponse | null = null;
  mensajes: MensajeResponse[] = [];
  nuevoMensaje = '';
  currentUserId: number | null = null;

  cargandoAsignaciones = false;
  enviando = false;
  errorAsignaciones = '';
  errorMensajes = '';

  private pollSub?: Subscription;
  private debeScrollear = false;

  constructor(
    private auth: AuthService,
    private tecnicoSvc: TecnicoService,
    private comunicacionSvc: ComunicacionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    this.cargarAsignaciones();
  }

  ngAfterViewChecked(): void {
    if (this.debeScrollear) {
      this.scrollAlFinal();
      this.debeScrollear = false;
    }
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  cargarAsignaciones(): void {
    this.cargandoAsignaciones = true;
    this.errorAsignaciones = '';
    this.tecnicoSvc.listarActivas().subscribe({
      next: (list) => {
        this.asignaciones = list;
        this.cargandoAsignaciones = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorAsignaciones = 'No se pudieron cargar las conversaciones activas.';
        this.cargandoAsignaciones = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarAsignacion(asig: AsignacionResponse): void {
    this.asignacionSeleccionada = asig;
    this.mensajes = [];
    this.errorMensajes = '';
    this.pollSub?.unsubscribe();
    this.iniciarPolling(asig.id);
  }

  private iniciarPolling(asignacionId: number): void {
    this.cargarMensajes(asignacionId);
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() =>
          this.comunicacionSvc.listarMensajes(asignacionId).pipe(
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe((msgs) => {
        if (msgs !== null) {
          const nuevosIds = new Set(msgs.map((m) => m.id));
          const hayNuevos = msgs.length !== this.mensajes.length ||
            msgs.some((m) => !this.mensajes.find((e) => e.id === m.id));
          if (hayNuevos) {
            this.mensajes = msgs;
            this.debeScrollear = true;
            this.cdr.detectChanges();
          }
          void nuevosIds;
        }
      });
  }

  private cargarMensajes(asignacionId: number): void {
    this.comunicacionSvc.listarMensajes(asignacionId).subscribe({
      next: (msgs) => {
        this.mensajes = msgs;
        this.debeScrollear = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMensajes = 'Error al cargar mensajes.';
        this.cdr.detectChanges();
      },
    });
  }

  enviarMensaje(): void {
    const texto = this.nuevoMensaje.trim();
    if (!texto || !this.asignacionSeleccionada || this.enviando) return;

    this.enviando = true;
    this.comunicacionSvc
      .enviarMensaje({ asignacion_id: this.asignacionSeleccionada.id, contenido: texto })
      .subscribe({
        next: (msg) => {
          this.mensajes = [...this.mensajes, msg];
          this.nuevoMensaje = '';
          this.debeScrollear = true;
          this.enviando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.enviando = false;
          this.cdr.detectChanges();
        },
      });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  esMio(msg: MensajeResponse): boolean {
    return msg.usuario_id === this.currentUserId;
  }

  rolLabel(rol: string): string {
    const map: Record<string, string> = {
      taller: 'Taller', tecnico: 'Técnico', cliente: 'Cliente', admin: 'Admin',
    };
    return map[rol] ?? rol;
  }

  private scrollAlFinal(): void {
    try {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch { /* ignore */ }
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
  }
}
