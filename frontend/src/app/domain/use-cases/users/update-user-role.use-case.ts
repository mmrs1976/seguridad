import { Observable } from 'rxjs';
import { UserEntity } from '../../entities/user.entity';
import { UserManagementRepository } from '../../ports/user-management.repository';

export class UpdateUserRoleUseCase {
  constructor(private readonly userRepository: UserManagementRepository) {}

  execute(userId: string, roleId: number): Observable<UserEntity> {
    return this.userRepository.updateUserRole(userId, roleId);
  }
}
