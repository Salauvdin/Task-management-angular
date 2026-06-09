// src/app/guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Basic Token Check
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Token Expiration Check
  if (authService.isTokenExpired()) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  // 3. Super Admin Check for Tenants route
  const path = route.routeConfig?.path;
  if (path === 'tenants') {
    if (!authService.isSuperAdmin()) {
      console.warn('Access Denied: Only Super Admins can access Tenants management');
      router.navigate(['/admin/dashboard']);
      return false;
    }
  }

  // 4. Permission-based Check (from route data)
  const permission = route.data?.['permission'] as { menu: string; action: string } | undefined;
  if (permission) {
    const hasPermission = authService.hasPermission(permission.menu, permission.action as any);
    if (!hasPermission) {
      console.warn(`Access Denied: Missing ${permission.action} permission for ${permission.menu}`);
      router.navigate(['/admin/dashboard']); 
      return false;
    }
  }

  return true;
};