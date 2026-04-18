import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CotizacionService, CotizacionResponse } from '../cotizacion.service';

@Component({
  selector: 'app-ver-cotizacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-cotizacion.component.html',
})
export class VerCotizacionComponent implements OnInit {

  cotizaciones: CotizacionResponse[] = [];
  loading  = false;
  errorMsg = '';

  constructor(
    private svc: CotizacionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.svc.listar().subscribe({
      next: (data) => { this.cotizaciones = data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar cotizaciones';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/app/cotizacion-pagos/confirmar-cotizacion'], { queryParams: { id } });
  }

  badgeEstado(estado: string): string {
    return { pendiente: 'badge-warning', aceptada: 'badge-success', rechazada: 'badge-danger' }[estado] ?? 'badge-muted';
  }
}
