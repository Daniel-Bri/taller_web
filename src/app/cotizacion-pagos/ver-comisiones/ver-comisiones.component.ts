import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionService, ComisionesResponse } from '../cotizacion.service';

@Component({
  selector: 'app-ver-comisiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-comisiones.component.html',
})
export class VerComisionesComponent implements OnInit {
  data: ComisionesResponse | null = null;
  loading  = false;
  errorMsg = '';

  constructor(private svc: CotizacionService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.svc.listarComisiones().subscribe({
      next: (res) => {
        this.data    = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'Error al cargar comisiones';
        this.loading  = false;
        this.cdr.detectChanges();
      },
    });
  }

  get tasaPct(): number { return (this.data?.tasa_comision ?? 0.10) * 100; }
}
