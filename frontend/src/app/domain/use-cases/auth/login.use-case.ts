import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';
import { UserEntity } from '../../entities/user.entity';
import { AuthCredentials, createAuthCredentials } from '../../value-objects/auth-credentials.vo';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string, password: string): Observable<UserEntity> {
    const credentials: AuthCredentials = createAuthCredentials(email, password);
    return this.authRepository.login(credentials);
  }
}
