import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { SolicitudDetalle, SolicitudService } from '../solicitud.service';

@Component({
  selector: 'app-ver-detalle-incidente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-detalle-incidente.component.html',
  styleUrl: './ver-detalle-incidente.component.css',
})
export class VerDetalleIncidenteComponent implements OnInit {
  incidenteId = 0;
  loading = false;
  errorMsg = '';
  data: SolicitudDetalle | null = null;

  constructor(private route: ActivatedRoute, private svc: SolicitudService) {}

  ngOnInit(): void {
    const qpId = Number(this.route.snapshot.queryParamMap.get('incidenteId') || 0);
    this.incidenteId = Number.isFinite(qpId) ? qpId : 0;
    if (this.incidenteId > 0) this.cargar();
  }

  cargar(): void {
    if (this.incidenteId <= 0) return;
    this.loading = true;
    this.errorMsg = '';
    this.svc.detalleIncidente(this.incidenteId).subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.errorMsg =
          e?.error?.detail ??
          (typeof e?.message === 'string' ? e.message : 'No se pudo cargar el detalle');
      },
    });
  }

  fullAsset(path: string): string {
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
