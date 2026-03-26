import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string, token: string, password: string, passwordConfirmation: string): Observable<string> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !token.trim()) {
      throw new Error('El enlace de recuperación es inválido');
    }

    return this.authRepository.resetPassword(normalizedEmail, token.trim(), password, passwordConfirmation);
  }
}
