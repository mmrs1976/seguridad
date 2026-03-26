import { Observable } from 'rxjs';
import { UserEntity } from '../../entities/user.entity';
import { UserManagementRepository } from '../../ports/user-management.repository';

export class UpdateUserActiveUseCase {
  constructor(private readonly userRepository: UserManagementRepository) {}

  execute(userId: string, active: boolean): Observable<UserEntity> {
    return this.userRepository.updateUserActive(userId, active);
  }
}