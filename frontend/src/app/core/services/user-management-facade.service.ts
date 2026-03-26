import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserPayload, CreateUserResult } from '../../domain/ports/user-management.repository';
import { CreateUserUseCase } from '../../domain/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../domain/use-cases/users/delete-user.use-case';
import { GetUsersUseCase } from '../../domain/use-cases/users/get-users.use-case';
import { UpdateUserActiveUseCase } from '../../domain/use-cases/users/update-user-active.use-case';
import { UpdateUserRoleUseCase } from '../../domain/use-cases/users/update-user-role.use-case';
import { UserManagementRepositoryImpl } from '../../infrastructure/repositories/user-management.repository.impl';

@Injectable({ providedIn: 'root' })
export class UserManagementFacadeService {
  private readonly userRepository = inject(UserManagementRepositoryImpl);
  private readonly getUsersUseCase = new GetUsersUseCase(this.userRepository);
  private readonly createUserUseCase = new CreateUserUseCase(this.userRepository);
  private readonly updateUserActiveUseCase = new UpdateUserActiveUseCase(this.userRepository);
  private readonly updateUserRoleUseCase = new UpdateUserRoleUseCase(this.userRepository);
  private readonly deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

  private readonly _users = signal<UserEntity[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadUsers(): Observable<UserEntity[]> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.getUsersUseCase.execute().pipe(
      tap((users) => this._users.set(users)),
      catchError((err: unknown) => this.handleError(err, 'Error al cargar usuarios')),
      finalize(() => this._isLoading.set(false))
    );
  }

  createUser(payload: CreateUserPayload): Observable<CreateUserResult> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.createUserUseCase.execute(payload).pipe(
      tap((result) => {
        this._users.update((users) => [result.user, ...users]);
      }),
      catchError((err: unknown) => this.handleError(err, 'Error al crear usuario')),
      finalize(() => this._isLoading.set(false))
    );
  }

  updateUserActive(userId: string, active: boolean): Observable<UserEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.updateUserActiveUseCase.execute(userId, active).pipe(
      tap((updatedUser) => {
        this._users.update((users) =>
          users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      }),
      catchError((err: unknown) => this.handleError(err, 'Error al actualizar estado del usuario')),
      finalize(() => this._isLoading.set(false))
    );
  }

  updateUserRole(userId: string, roleId: number): Observable<UserEntity> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.updateUserRoleUseCase.execute(userId, roleId).pipe(
      tap((updatedUser) => {
        this._users.update((users) =>
          users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      }),
      catchError((err: unknown) => this.handleError(err, 'Error al cambiar el perfil del usuario')),
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteUser(userId: string): Observable<string> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.deleteUserUseCase.execute(userId).pipe(
      tap(() => {
        this._users.update((users) => users.filter((user) => user.id !== userId));
      }),
      catchError((err: unknown) => this.handleError(err, 'Error al eliminar usuario')),
      finalize(() => this._isLoading.set(false))
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
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }

    return fallback;
  }
}