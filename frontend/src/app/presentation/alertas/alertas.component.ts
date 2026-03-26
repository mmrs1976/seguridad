import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertRepositoryImpl } from '../../infrastructure/repositories/alert.repository.impl';
import { GetAlertsUseCase } from '../../domain/use-cases/alerts/get-alerts.use-case';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Alertas</h1>
    @if (isLoading) {
      <p>Cargando alertas...</p>
    }
    @if (errorMessage) {
      <p class="error">{{ errorMessage }}</p>
    }
    @for (alert of alerts; track alert.id) {
      <div class="alert-item">
        <strong>{{ alert.title }}</strong>
        <span [class]="'severity-' + alert.severity">{{ alert.severity }}</span>
        <p>{{ alert.description }}</p>
      </div>
    }
  `
})
export class AlertasComponent implements OnInit {
  alerts: AlertEntity[] = [];
  isLoading = false;
  errorMessage = '';

  private readonly alertRepository = inject(AlertRepositoryImpl);
  private readonly getAlertsUseCase = new GetAlertsUseCase(this.alertRepository);

  ngOnInit(): void {
    this.isLoading = true;
    this.getAlertsUseCase.execute().subscribe({
      next: (alerts: AlertEntity[]) => { this.alerts = alerts; },
      error: (err: unknown) => {
        this.errorMessage = err instanceof Error ? err.message : 'Error al cargar alertas';
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; }
    });
  }
}
