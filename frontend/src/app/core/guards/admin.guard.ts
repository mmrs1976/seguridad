import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacadeService } from '../services/auth-facade.service';

export const AdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authFacade = inject(AuthFacadeService);
  const user = authFacade.currentUser();

  if (authFacade.isLoggedIn() && user?.roleCode === 'admin') {
    return true;
  }

  router.navigate(['/home/encuesta']);
  return false;
};
