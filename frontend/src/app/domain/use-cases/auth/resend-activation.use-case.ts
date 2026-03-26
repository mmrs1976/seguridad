import { Observable } from 'rxjs';
import { AuthRepository } from '../../ports/auth.repository';

export class ResendActivationUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string): Observable<string> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('El correo electrónico es requerido');
    }

    return this.authRepository.resendActivation(normalizedEmail);
  }
}