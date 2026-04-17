// guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Check if token is expired
    if (authService.isTokenExpired()) {
      authService.logout();
      router.navigate(['/login']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};