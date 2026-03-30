import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  const currentUser = authService.currentUser();
  if (currentUser && expectedRole === currentUser.role) return true;
  else {
    router.navigate(['/home']);
    return false;
  }
};
