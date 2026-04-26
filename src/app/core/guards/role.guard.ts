import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../acceso-registro/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const userRole = auth.getUser()?.role;
  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  const roles = route.data['roles'] as string[] | undefined;
  if (!roles || roles.includes(userRole)) return true;

  router.navigate(['/app/acceso-denegado']);
  return false;
};
