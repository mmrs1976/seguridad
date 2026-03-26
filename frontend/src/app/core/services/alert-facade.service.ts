import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';
import { AlertRepositoryImpl } from '../../infrastructure/repositories/alert.repository.impl';
import { GetAlertsUseCase } from '../../domain/use-cases/alerts/get-alerts.use-case';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Injectable({ providedIn: 'root' })
export class AlertFacadeService {
  private readonly alertRepository = inject(AlertRepositoryImpl);
  private readonly getAlertsUseCase = new GetAlertsUseCase(this.alertRepository);

  private readonly _alerts = signal<AlertEntity[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly alerts = this._alerts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadAlerts(): Observable<AlertEntity[]> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.getAlertsUseCase.execute().pipe(
      tap((alerts) => this._alerts.set(alerts)),
      catchError((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al cargar alertas';
        this._error.set(message);
        return throwError(() => err);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }
}
