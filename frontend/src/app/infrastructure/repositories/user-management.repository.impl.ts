import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserManagementRepository } from '../../domain/ports/user-management.repository';
import { HttpClientAdapter } from '../adapters/http/http-client.adapter';
import { environment } from '../../../environments/environment';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  email_verified_at: string | null;
  role_id: number | null;
  role_name: string | null;
  role_code: string | null;
}

interface UserMutationResponse {
  message: string;
  user: ApiUser;
}

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementRepositoryImpl implements UserManagementRepository {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly httpClient: HttpClientAdapter) {}

  getUsers(): Observable<UserEntity[]> {
    return this.httpClient
      .get<ApiUser[]>(`${this.baseUrl}/users`)
      .pipe(map((users) => users.map((user) => this.mapUser(user))));
  }

  updateUserActive(userId: string, active: boolean): Observable<UserEntity> {
    return this.httpClient
      .patch<UserMutationResponse>(`${this.baseUrl}/users/${userId}/active`, { active })
      .pipe(map((response) => this.mapUser(response.user)));
  }

  updateUserRole(userId: string, roleId: number): Observable<UserEntity> {
    return this.httpClient
      .patch<UserMutationResponse>(`${this.baseUrl}/users/${userId}/role`, { role_id: roleId })
      .pipe(map((response) => this.mapUser(response.user)));
  }

  deleteUser(userId: string): Observable<string> {
    return this.httpClient
      .delete<MessageResponse>(`${this.baseUrl}/users/${userId}`)
      .pipe(map((response) => response.message));
  }

  private mapUser(user: ApiUser): UserEntity {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      emailVerifiedAt: user.email_verified_at,
      roleId: user.role_id,
      roleName: user.role_name,
      roleCode: user.role_code,
    };
  }
}