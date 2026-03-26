import { Observable } from 'rxjs';
import { UserEntity } from '../../entities/user.entity';
import { UserManagementRepository } from '../../ports/user-management.repository';

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserManagementRepository) {}

  execute(): Observable<UserEntity[]> {
    return this.userRepository.getUsers();
  }
}