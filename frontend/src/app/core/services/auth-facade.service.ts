import { Injectable, inject } from '@angular/core';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';
import { AuthState } from '../state/auth.state';
import { LoginUseCase } from '../../domain/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../domain/use-cases/auth/register.use-case';
import { LogoutUseCase } from '../../domain/use-cases/auth/logout.use-case';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authRepository = inject(AuthRepositoryImpl);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  private readonly loginUseCase = new LoginUseCase(this.authRepository);
  private readonly registerUseCase = new RegisterUseCase(this.authRepository);
  private readonly logoutUseCase = new LogoutUseCase(this.authRepository);

  readonly currentUser = this.authState.currentUser;
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly isLoading = this.authState.isLoading;
  readonly error = this.authState.error;

  constructor() {
    const savedUser = this.authRepository.getCurrentUser();
    if (savedUser && this.authRepository.isAuthenticated()) {
      this.authState.setUser(savedUser);
    }
  }

  login(email: string, password: string): Observable<UserEntity> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.loginUseCase.execute(email, password).pipe(
      tap((user) => this.authState.setUser(user)),
      catchError((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
        this.authState.setError(message);
        return throwError(() => err);
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  register(name: string, email: string, password: string): Observable<UserEntity> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.registerUseCase.execute(name, email, password).pipe(
      tap((user) => this.authState.setUser(user)),
      catchError((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al registrarse';
        this.authState.setError(message);
        return throwError(() => err);
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  logout(): void {
    this.logoutUseCase.execute().pipe(
      tap(() => {
        this.authState.clearState();
        this.router.navigate(['/login']);
      })
    ).subscribe();
  }

  isLoggedIn(): boolean {
    return this.authRepository.isAuthenticated();
  }
}
