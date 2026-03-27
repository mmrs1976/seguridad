import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';
import { MenuOptionEntity } from '../../domain/entities/menu-option.entity';
import { HttpClientAdapter } from '../../infrastructure/adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

interface ApiOption {
  id: number;
  name: string;
  route: string | null;
  icon: string | null;
  is_group: boolean;
  parent_id: number | null;
  sort_order: number;
  active: boolean;
  role_ids: number[];
}

interface OptionMutationResponse {
  message: string;
  option: ApiOption;
}

interface MessageResponse {
  message: string;
}

export interface OptionPayload {
  name: string;
  route: string | null;
  icon: string;
  isGroup: boolean;
  parentId: number | null;
  sortOrder: number;
  active: boolean;
  roleIds: number[];
}

@Injectable({ providedIn: 'root' })
export class OptionManagementFacadeService {
  private readonly http = inject(HttpClientAdapter);
  private readonly baseUrl = environment.apiUrl;

  private readonly _options = signal<MenuOptionEntity[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly options = this._options.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadOptions(): Observable<MenuOptionEntity[]> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.get<ApiOption[]>(`${this.baseUrl}/options`).pipe(
      map((options) => options.map((option) => this.mapOption(option))),
      tap((options) => this._options.set(options)),
      catchError((err: unknown) => this.handleError(err, 'No se pudieron cargar las opciones.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  createOption(payload: OptionPayload): Observable<MenuOptionEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.post<OptionMutationResponse>(`${this.baseUrl}/options`, this.toApiPayload(payload)).pipe(
      map((response) => this.mapOption(response.option)),
      tap((option) => this._options.update((options) => [...options, option].sort((a, b) => a.sortOrder - b.sortOrder))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo crear la opción.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  updateOption(optionId: number, payload: OptionPayload): Observable<MenuOptionEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.put<OptionMutationResponse>(`${this.baseUrl}/options/${optionId}`, this.toApiPayload(payload)).pipe(
      map((response) => this.mapOption(response.option)),
      tap((updatedOption) => this._options.update((options) => options.map((option) => option.id === updatedOption.id ? updatedOption : option))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo actualizar la opción.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteOption(optionId: number): Observable<string> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.delete<MessageResponse>(`${this.baseUrl}/options/${optionId}`).pipe(
      map((response) => response.message),
      tap(() => this._options.update((options) => options.filter((option) => option.id !== optionId))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo eliminar la opción.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  private toApiPayload(payload: OptionPayload) {
    return {
      name: payload.name,
      route: payload.route,
      icon: payload.icon,
      is_group: payload.isGroup,
      parent_id: payload.parentId,
      sort_order: payload.sortOrder,
      active: payload.active,
      role_ids: payload.roleIds,
    };
  }

  private mapOption(option: ApiOption): MenuOptionEntity {
    return {
      id: option.id,
      name: option.name,
      route: option.route,
      icon: option.icon,
      isGroup: option.is_group,
      parentId: option.parent_id,
      sortOrder: option.sort_order,
      active: option.active,
      roleIds: option.role_ids ?? [],
    };
  }

  private handleError(err: unknown, fallback: string): Observable<never> {
    const message = this.extractErrorMessage(err, fallback);
    this._error.set(message);
    return throwError(() => new Error(message));
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const apiMessage = err.error?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }

    if (err instanceof Error && err.message.trim()) {
      return err.message;
    }

    return fallback;
  }
}