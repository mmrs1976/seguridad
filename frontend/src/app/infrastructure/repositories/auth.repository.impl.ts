import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { AuthRepository } from '../../domain/ports/auth.repository';
import { UserEntity } from '../../domain/entities/user.entity';
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
    roles?: string[];
  };
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
          token: response.token,
          roles: response.user.roles
        }))
      );
  }

  register(credentials: RegisterCredentials): Observable<UserEntity> {
    return this.httpClient
      .post<AuthResponse>(`${this.baseUrl}/auth/register`, credentials)
      .pipe(
        tap((response) => {
          this.storage.setItem(this.tokenKey, response.token);
          this.storage.setItem(this.userKey, JSON.stringify(response.user));
        }),
        map((response): UserEntity => ({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          token: response.token,
          roles: response.user.roles
        }))
      );
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
