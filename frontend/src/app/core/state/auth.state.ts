import { Injectable, signal, computed } from '@angular/core';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _currentUser = signal<UserEntity | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  setUser(user: UserEntity | null): void {
    this._currentUser.set(user);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearState(): void {
    this._currentUser.set(null);
    this._isLoading.set(false);
    this._error.set(null);
  }
}
