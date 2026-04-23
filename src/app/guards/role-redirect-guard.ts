// src/app/guards/role-redirect.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn() || authService.isTokenExpired()) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRole();

  switch (role) {
    case 'admin':
      router.navigate(['/admin/dashboard']);
      break;
    case 'manager':
      router.navigate(['/manager/dashboard']);
      break;
    case 'teammember':
      router.navigate(['/teammember/tasks']);
      break;
    default:
      router.navigate(['/login']);
  }

  return false;
};