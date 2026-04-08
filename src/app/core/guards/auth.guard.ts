import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../acceso-registro/auth.service';

export const authGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
