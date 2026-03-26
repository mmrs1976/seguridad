import { Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';

export interface UserManagementRepository {
  getUsers(): Observable<UserEntity[]>;
  updateUserActive(userId: string, active: boolean): Observable<UserEntity>;
  updateUserRole(userId: string, roleId: number): Observable<UserEntity>;
  deleteUser(userId: string): Observable<string>;
}

export const USER_MANAGEMENT_REPOSITORY = 'USER_MANAGEMENT_REPOSITORY';