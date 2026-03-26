import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';
import { AuthState } from '../state/auth.state';
import { LoginUseCase } from '../../domain/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../domain/use-cases/auth/register.use-case';
import { LogoutUseCase } from '../../domain/use-cases/auth/logout.use-case';
import { ResendActivationUseCase } from '../../domain/use-cases/auth/resend-activation.use-case';
import { ForgotPasswordUseCase } from '../../domain/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../domain/use-cases/auth/reset-password.use-case';
import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterResultEntity } from '../../domain/entities/register-result.entity';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authRepository = inject(AuthRepositoryImpl);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  private readonly loginUseCase = new LoginUseCase(this.authRepository);
  private readonly registerUseCase = new RegisterUseCase(this.authRepository);
  private readonly logoutUseCase = new LogoutUseCase(this.authRepository);
  private readonly resendActivationUseCase = new ResendActivationUseCase(this.authRepository);
  private readonly forgotPasswordUseCase = new ForgotPasswordUseCase(this.authRepository);
  private readonly resetPasswordUseCase = new ResetPasswordUseCase(this.authRepository);

  readonly currentUser = this.authState.currentUser;
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly isLoading = this.authState.isLoading;
  readonly error = this.authState.error;

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
        const message = this.extractErrorMessage(err, 'Error al iniciar sesión');
        this.authState.setError(message);
        return throwError(() => new Error(message));
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  register(name: string, email: string, password: string, captchaToken: string): Observable<RegisterResultEntity> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.registerUseCase.execute(name, email, password, captchaToken).pipe(
      catchError((err: unknown) => {
        const message = this.extractErrorMessage(err, 'Error al registrarse');
        this.authState.setError(message);
        return throwError(() => new Error(message));
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  resendActivation(email: string): Observable<string> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.resendActivationUseCase.execute(email).pipe(
      catchError((err: unknown) => {
        const message = this.extractErrorMessage(err, 'Error al reenviar activación');
        this.authState.setError(message);
        return throwError(() => new Error(message));
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  forgotPassword(email: string): Observable<string> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.forgotPasswordUseCase.execute(email).pipe(
      catchError((err: unknown) => {
        const message = this.extractErrorMessage(err, 'Error al solicitar recuperación');
        this.authState.setError(message);
        return throwError(() => new Error(message));
      }),
      finalize(() => this.authState.setLoading(false))
    );
  }

  resetPassword(email: string, token: string, password: string, passwordConfirmation: string): Observable<string> {
    this.authState.setLoading(true);
    this.authState.setError(null);
    return this.resetPasswordUseCase.execute(email, token, password, passwordConfirmation).pipe(
      catchError((err: unknown) => {
        const message = this.extractErrorMessage(err, 'Error al restablecer contraseña');
        this.authState.setError(message);
        return throwError(() => new Error(message));
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
