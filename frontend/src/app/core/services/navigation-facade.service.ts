import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';
import { MenuOptionEntity } from '../../domain/entities/menu-option.entity';
import { HttpClientAdapter } from '../../infrastructure/adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

interface NavigationResponse {
  items: Array<{
    id: number;
    name: string;
    route: string | null;
    icon: string | null;
    is_group: boolean;
    parent_id: number | null;
    sort_order: number;
    children: Array<{
      id: number;
      name: string;
      route: string | null;
      icon: string | null;
      is_group: boolean;
      parent_id: number | null;
      sort_order: number;
      children: [];
    }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class NavigationFacadeService {
  private readonly http = inject(HttpClientAdapter);
  private readonly baseUrl = environment.apiUrl;

  private readonly _items = signal<MenuOptionEntity[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadNavigation(): Observable<MenuOptionEntity[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<NavigationResponse>(`${this.baseUrl}/navigation`).pipe(
      map((response) => response.items.map((item) => this.mapNavigationItem(item))),
      tap((items) => this._items.set(items)),
      catchError((err: unknown) => {
        const message = this.extractErrorMessage(err, 'No se pudo cargar el menú lateral.');
        this._error.set(message);
        return throwError(() => new Error(message));
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  private mapNavigationItem(item: NavigationResponse['items'][number]): MenuOptionEntity {
    return {
      id: item.id,
      name: item.name,
      route: item.route,
      icon: item.icon,
      isGroup: item.is_group,
      parentId: item.parent_id,
      sortOrder: item.sort_order,
      active: true,
      children: (item.children ?? []).map((child) => this.mapNavigationItem(child)),
    };
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