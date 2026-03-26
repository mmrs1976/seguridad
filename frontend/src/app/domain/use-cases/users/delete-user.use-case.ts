import { Observable } from 'rxjs';
import { UserManagementRepository } from '../../ports/user-management.repository';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserManagementRepository) {}

  execute(userId: string): Observable<string> {
    return this.userRepository.deleteUser(userId);
  }
}