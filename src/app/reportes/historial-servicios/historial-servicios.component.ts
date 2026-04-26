import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionService, HistorialItem } from '../../cotizacion-pagos/cotizacion.service';

@Component({
  selector: 'app-historial-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-servicios.component.html',
})
export class HistorialServiciosComponent implements OnInit {
  historial: HistorialItem[] = [];
  loading  = false;
  errorMsg = '';

  constructor(private svc: CotizacionService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.svc.listarHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.loading   = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar el historial';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  parsearRepuestos(raw: string | null): string {
    if (!raw) return '—';
    try {
      const list = JSON.parse(raw) as { descripcion: string; cantidad: number }[];
      return list.map(r => `${r.descripcion} ×${r.cantidad}`).join(', ') || '—';
    } catch { return '—'; }
  }
}
