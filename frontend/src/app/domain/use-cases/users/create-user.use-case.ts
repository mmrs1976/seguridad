import { Observable } from 'rxjs';
import { CreateUserPayload, CreateUserResult, UserManagementRepository } from '../../ports/user-management.repository';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserManagementRepository) {}

  execute(payload: CreateUserPayload): Observable<CreateUserResult> {
    return this.userRepository.createUser(payload);
  }
}
