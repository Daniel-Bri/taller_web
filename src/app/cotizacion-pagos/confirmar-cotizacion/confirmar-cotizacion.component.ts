import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CotizacionService, CotizacionResponse, ItemCotizacion } from '../cotizacion.service';

@Component({
  selector: 'app-confirmar-cotizacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmar-cotizacion.component.html',
})
export class ConfirmarCotizacionComponent implements OnInit {

  cotizacion: CotizacionResponse | null = null;
  items: ItemCotizacion[] = [];

  loading    = false;
  procesando: 'aceptando' | 'rechazando' | null = null;
  errorMsg   = '';
  successMsg = '';

  constructor(
    private svc: CotizacionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (!id) { this.errorMsg = 'No se especificó una cotización válida'; return; }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading  = true;
    this.errorMsg = '';
    this.svc.getById(id).subscribe({
      next: (data) => {
        this.cotizacion = data;
        this.items      = this.svc.parsearItems(data.detalle);
        this.loading    = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar la cotización';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmar(): void {
    this.ejecutarAccion('aceptada', 'aceptando');
  }

  rechazar(): void {
    this.ejecutarAccion('rechazada', 'rechazando');
  }

  private ejecutarAccion(estado: 'aceptada' | 'rechazada', modo: 'aceptando' | 'rechazando'): void {
    this.procesando = modo;
    this.errorMsg   = '';
    this.svc.actualizarEstado(this.cotizacion!.id, estado).subscribe({
      next: (actualizada) => {
        this.cotizacion = actualizada;
        this.items      = this.svc.parsearItems(actualizada.detalle);
        this.successMsg = estado === 'aceptada'
          ? 'Cotización aceptada. El cliente puede proceder al pago.'
          : 'Cotización rechazada.';
        this.procesando = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg   = err.error?.detail ?? 'Error al actualizar el estado';
        this.procesando = null;
        this.cdr.detectChanges();
      },
    });
  }

  get subtotal(): number {
    return this.items.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0);
  }
}
