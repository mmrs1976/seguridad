import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Observable<void> {
    return this.authRepository.logout();
  }
}
