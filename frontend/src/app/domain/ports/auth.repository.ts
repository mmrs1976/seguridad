import { Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import { RegisterResultEntity } from '../entities/register-result.entity';
import { AuthCredentials, RegisterCredentials } from '../value-objects/auth-credentials.vo';

export interface AuthRepository {
  login(credentials: AuthCredentials): Observable<UserEntity>;
  register(credentials: RegisterCredentials): Observable<RegisterResultEntity>;
  resendActivation(email: string): Observable<string>;
  forgotPassword(email: string): Observable<string>;
  resetPassword(email: string, token: string, password: string, passwordConfirmation: string): Observable<string>;
  logout(): Observable<void>;
  getCurrentUser(): UserEntity | null;
  isAuthenticated(): boolean;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
