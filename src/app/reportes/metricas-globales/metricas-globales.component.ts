import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, MetricasResumenResponse } from '../reportes.service';

@Component({
  selector: 'app-metricas-globales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metricas-globales.component.html',
})
export class MetricasGlobalesComponent {
  desde = '';
  hasta = '';
  loading = false;
  errorMsg = '';
  resumen: MetricasResumenResponse | null = null;

  constructor(private reportes: ReportesService) {}

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';
    this.reportes.metricasGlobales({
      desde: this.desde ? `${this.desde}T00:00:00` : undefined,
      hasta: this.hasta ? `${this.hasta}T23:59:59` : undefined,
    }).subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.detail ?? 'No se pudo cargar el reporte global';
        this.loading = false;
      },
    });
  }

  exportarCSV(): void {
    if (!this.resumen) return;
    const header = 'pago_id,cotizacion_id,incidente_id,monto,metodo,fecha';
    const rows = this.resumen.detalle_pagos.map((p) =>
      [p.pago_id, p.cotizacion_id, p.incidente_id, p.monto.toFixed(2), p.metodo, p.fecha ?? ''].join(','),
    );
    this.descargar('reporte_global.csv', `${header}\n${rows.join('\n')}`, 'text/csv;charset=utf-8;');
  }

  exportarExcel(): void {
    if (!this.resumen) return;
    const header = 'Pago\tCotizacion\tIncidente\tMonto\tMetodo\tFecha';
    const rows = this.resumen.detalle_pagos.map((p) =>
      [p.pago_id, p.cotizacion_id, p.incidente_id, p.monto.toFixed(2), p.metodo, p.fecha ?? ''].join('\t'),
    );
    this.descargar('reporte_global.xls', `${header}\n${rows.join('\n')}`, 'application/vnd.ms-excel;charset=utf-8;');
  }

  exportarPDF(): void {
    if (!this.resumen) return;
    const tableRows = this.resumen.detalle_pagos
      .map(
        (p) =>
          `<tr><td>${p.pago_id}</td><td>${p.cotizacion_id}</td><td>${p.incidente_id}</td><td>Bs ${p.monto.toFixed(
            2,
          )}</td><td>${p.metodo}</td><td>${p.fecha ?? ''}</td></tr>`,
      )
      .join('');
    const html = `<!doctype html><html><body><h3>Reporte Global del Sistema</h3><table border="1" cellspacing="0" cellpadding="6"><tr><th>Pago</th><th>Cotizacion</th><th>Incidente</th><th>Monto</th><th>Metodo</th><th>Fecha</th></tr>${tableRows}</table></body></html>`;
    const w = window.open('', '_blank', 'width=980,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  private descargar(filename: string, content: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
