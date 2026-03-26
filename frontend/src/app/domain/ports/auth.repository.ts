import { Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import { AuthCredentials, RegisterCredentials } from '../value-objects/auth-credentials.vo';

export interface AuthRepository {
  login(credentials: AuthCredentials): Observable<UserEntity>;
  register(credentials: RegisterCredentials): Observable<UserEntity>;
  logout(): Observable<void>;
  getCurrentUser(): UserEntity | null;
  isAuthenticated(): boolean;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
