import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';
import { RegisterResultEntity } from '../../entities/register-result.entity';
import { RegisterCredentials, createRegisterCredentials } from '../../value-objects/auth-credentials.vo';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(name: string, email: string, password: string, captchaToken: string): Observable<RegisterResultEntity> {
    const credentials: RegisterCredentials = createRegisterCredentials(name, email, password, captchaToken);
    return this.authRepository.register(credentials);
  }
}
