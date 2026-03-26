import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacadeService } from '../services/auth-facade.service';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authFacade = inject(AuthFacadeService);
  if (authFacade.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
