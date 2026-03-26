import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertFacadeService } from '../../core/services/alert-facade.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Alertas</h1>
    @if (alertFacade.isLoading()) {
      <p>Cargando alertas...</p>
    }
    @if (alertFacade.error()) {
      <p class="error">{{ alertFacade.error() }}</p>
    }
    @for (alert of alertFacade.alerts(); track alert.id) {
      <div class="alert-item">
        <strong>{{ alert.title }}</strong>
        <span [class]="'severity-' + alert.severity">{{ alert.severity }}</span>
        <p>{{ alert.description }}</p>
      </div>
    }
  `
})
export class AlertasComponent implements OnInit {
  readonly alertFacade = inject(AlertFacadeService);

  ngOnInit(): void {
    this.alertFacade.loadAlerts().subscribe();
  }
}
