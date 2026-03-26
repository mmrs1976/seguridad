import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
import { SurveyRepositoryImpl } from '../../infrastructure/repositories/survey.repository.impl';

@Injectable({ providedIn: 'root' })
export class SurveyFacadeService {
  private readonly repo = inject(SurveyRepositoryImpl);

  private readonly _survey = signal<SurveyResponseEntity | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _isSaving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly survey = this._survey.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly error = this._error.asReadonly();

  loadSurvey(): Observable<SurveyResponseEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.repo.getSurvey().pipe(
      tap((s) => this._survey.set(s)),
      catchError((err: unknown) => this.handleError(err, 'Error al cargar la encuesta')),
      finalize(() => this._isLoading.set(false))
    );
  }

  saveSurvey(data: Record<string, unknown>, submit: boolean): Observable<SurveyResponseEntity> {
    this._isSaving.set(true);
    this._error.set(null);
    return this.repo.saveSurvey(data, submit).pipe(
      tap((s) => this._survey.set(s)),
      catchError((err: unknown) => this.handleError(err, 'Error al guardar la encuesta')),
      finalize(() => this._isSaving.set(false))
    );
  }

  private handleError(err: unknown, fallback: string): Observable<never> {
    const message = this.extractErrorMessage(err, fallback);
    this._error.set(message);
    return throwError(() => new Error(message));
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const apiMessage = err.error?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;
    }
    if (err instanceof Error && err.message.trim().length > 0) return err.message;
    return fallback;
  }
}
