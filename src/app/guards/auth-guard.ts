// src/app/guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // if (!authService.isLoggedIn()) {
  //   router.navigate(['/login']);
  //   return false;
  // }

  // if (authService.isTokenExpired()) {
  //   authService.logout();
  //   router.navigate(['/login']);
  //   return false;
  // }

  const permission = route.data?.['permission'] as { menu: string; action: string } | undefined;

  if (permission) {
    // Cast action to 'any' to bypass PermissionAction strict type
    const hasPermission = authService.hasPermission(permission.menu, permission.action as any);
    if (!hasPermission) {
      router.navigate(['/login']); // redirect to login since /unauthorized doesn't exist yet
      return false;
    }
  }

  return true;
};