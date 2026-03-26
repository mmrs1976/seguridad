import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';
import { UserEntity } from '../../entities/user.entity';
import { RegisterCredentials, createRegisterCredentials } from '../../value-objects/auth-credentials.vo';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(name: string, email: string, password: string): Observable<UserEntity> {
    const credentials: RegisterCredentials = createRegisterCredentials(name, email, password);
    return this.authRepository.register(credentials);
  }
}
