import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';
import { RoleEntity } from '../../domain/entities/role.entity';
import { HttpClientAdapter } from '../../infrastructure/adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

interface ApiRole {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  option_ids: number[];
}

interface RoleMutationResponse {
  message: string;
  role: ApiRole;
}

interface MessageResponse {
  message: string;
}

export interface RolePayload {
  name: string;
  code: string;
  description: string;
  active: boolean;
  optionIds: number[];
}

@Injectable({ providedIn: 'root' })
export class RoleManagementFacadeService {
  private readonly http = inject(HttpClientAdapter);
  private readonly baseUrl = environment.apiUrl;

  private readonly _roles = signal<RoleEntity[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly roles = this._roles.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadRoles(): Observable<RoleEntity[]> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.get<ApiRole[]>(`${this.baseUrl}/roles`).pipe(
      map((roles) => roles.map((role) => this.mapRole(role))),
      tap((roles) => this._roles.set(roles)),
      catchError((err: unknown) => this.handleError(err, 'No se pudieron cargar los perfiles.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  createRole(payload: RolePayload): Observable<RoleEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.post<RoleMutationResponse>(`${this.baseUrl}/roles`, this.toApiPayload(payload)).pipe(
      map((response) => this.mapRole(response.role)),
      tap((role) => this._roles.update((roles) => [...roles, role].sort((a, b) => a.id - b.id))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo crear el perfil.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  updateRole(roleId: number, payload: RolePayload): Observable<RoleEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.put<RoleMutationResponse>(`${this.baseUrl}/roles/${roleId}`, this.toApiPayload(payload)).pipe(
      map((response) => this.mapRole(response.role)),
      tap((updatedRole) => this._roles.update((roles) => roles.map((role) => role.id === updatedRole.id ? updatedRole : role))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo actualizar el perfil.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteRole(roleId: number): Observable<string> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http.delete<MessageResponse>(`${this.baseUrl}/roles/${roleId}`).pipe(
      map((response) => response.message),
      tap(() => this._roles.update((roles) => roles.filter((role) => role.id !== roleId))),
      catchError((err: unknown) => this.handleError(err, 'No se pudo eliminar el perfil.')),
      finalize(() => this._isLoading.set(false))
    );
  }

  private toApiPayload(payload: RolePayload) {
    return {
      name: payload.name,
      code: payload.code,
      description: payload.description || null,
      active: payload.active,
      option_ids: payload.optionIds,
    };
  }

  private mapRole(role: ApiRole): RoleEntity {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      active: role.active,
      optionIds: role.option_ids ?? [],
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