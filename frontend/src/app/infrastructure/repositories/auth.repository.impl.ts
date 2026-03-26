import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { AuthRepository } from '../../domain/ports/auth.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterResultEntity } from '../../domain/entities/register-result.entity';
import { AuthCredentials, RegisterCredentials } from '../../domain/value-objects/auth-credentials.vo';
import { HttpClientAdapter } from '../adapters/http/http-client.adapter';
import { LocalStorageAdapter } from '../adapters/storage/local-storage.adapter';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    active?: boolean;
    email_verified_at?: string | null;
    role_id?: number | null;
    role_name?: string | null;
    role_code?: string | null;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    active?: boolean;
    email_verified_at?: string | null;
    role_id?: number | null;
    role_name?: string | null;
    role_code?: string | null;
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  captcha_token: string;
}

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthRepositoryImpl implements AuthRepository {
  private readonly baseUrl = environment.apiUrl;
  private readonly tokenKey = 'token';
  private readonly userKey = 'currentUser';

  constructor(
    private readonly httpClient: HttpClientAdapter,
    private readonly storage: LocalStorageAdapter
  ) {}

  login(credentials: AuthCredentials): Observable<UserEntity> {
    return this.httpClient
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.storage.setItem(this.tokenKey, response.token);
          this.storage.setItem(this.userKey, JSON.stringify(response.user));
        }),
        map((response): UserEntity => ({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          active: response.user.active,
          emailVerifiedAt: response.user.email_verified_at,
          roleId: response.user.role_id,
          roleName: response.user.role_name,
          roleCode: response.user.role_code,
          token: response.token,
        }))
      );
  }

  register(credentials: RegisterCredentials): Observable<RegisterResultEntity> {
    const payload: RegisterRequest = {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      captcha_token: credentials.captchaToken
    };

    return this.httpClient
      .post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload)
      .pipe(
        map((response): RegisterResultEntity => ({
          message: response.message,
          user: {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            active: response.user.active,
            emailVerifiedAt: response.user.email_verified_at,
            roleId: response.user.role_id,
            roleName: response.user.role_name,
            roleCode: response.user.role_code,
          }
        }))
      );
  }

  resendActivation(email: string): Observable<string> {
    return this.httpClient
      .post<MessageResponse>(`${this.baseUrl}/auth/resend-activation`, { email })
      .pipe(map((response) => response.message));
  }

  logout(): Observable<void> {
    return new Observable<void>((observer) => {
      this.storage.removeItem(this.tokenKey);
      this.storage.removeItem(this.userKey);
      observer.next();
      observer.complete();
    });
  }

  getCurrentUser(): UserEntity | null {
    const userData = this.storage.getItem(this.userKey);
    if (!userData) return null;
    try {
      return JSON.parse(userData) as UserEntity;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(this.tokenKey);
  }
}
