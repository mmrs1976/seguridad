import { Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  roleId: number;
  active: boolean;
  notifyUser: boolean;
}

export interface CreateUserResult {
  user: UserEntity;
  generatedPassword?: string;
}

export interface UserManagementRepository {
  getUsers(): Observable<UserEntity[]>;
  createUser(payload: CreateUserPayload): Observable<CreateUserResult>;
  updateUserActive(userId: string, active: boolean): Observable<UserEntity>;
  updateUserRole(userId: string, roleId: number): Observable<UserEntity>;
  deleteUser(userId: string): Observable<string>;
}

export const USER_MANAGEMENT_REPOSITORY = 'USER_MANAGEMENT_REPOSITORY';