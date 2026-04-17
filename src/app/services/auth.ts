import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// Define permission action type
export type PermissionAction = 'read' | 'write' | 'delete';

// Define permission interface
export interface Permission {
  menu: string;
  menuName?: string;
  read?: boolean;
  write?: boolean;
  delete?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}

// Define user interface
export interface User {
  name?: string;
  registerName?: string;
  email?: string;
  registerEmail?: string;
  role?: string;
  registerRole?: string;
  permissions?: Permission[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:3000/v1";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userPermissionsSubject = new BehaviorSubject<Permission[]>([]);
  
  currentUser$ = this.currentUserSubject.asObservable();
  userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Load saved user data on initialization
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.userPermissionsSubject.next(user.permissions || []);
      }
    }
  }

  // Login with backend API
  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          const userWithPermissions: User = {
            ...response.user,
            permissions: response.permissions || []
          };
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('login', 'true');
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(userWithPermissions));
          }
          
          this.currentUserSubject.next(userWithPermissions);
          this.userPermissionsSubject.next(response.permissions || []);
          
          // Navigate based on role
          this.navigateByRole(response.user.role);
        }
      })
    );
  }
  

  // Legacy login (for demo/testing)
  login(username: string, password: string) {
    if (username === 'admin' && password === '1234') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('login', 'true');
        // Set default admin permissions
        const adminUser: User = {
          name: 'Admin',
          email: 'admin@example.com',
          role: 'Admin',
          permissions: [
            { menu: 'View Dashboard', read: true, write: true, delete: true },
            { menu: 'Tasks', read: true, write: true, delete: true },
            { menu: 'User Management', read: true, write: true, delete: true },
            { menu: 'Reports', read: true, write: true, delete: true },
            { menu: 'Configuration', read: true, write: true, delete: true }
          ]
        };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        this.currentUserSubject.next(adminUser);
        this.userPermissionsSubject.next(adminUser.permissions || []);
      }
      this.router.navigate(['/admin/dashboard']);
    }
  }

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('login');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.userPermissionsSubject.next([]);
    this.router.navigate(['/login']);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('login') === 'true' || !!localStorage.getItem('token');
    }
    return false;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get user permissions
  getUserPermissions(): Permission[] {
    return this.userPermissionsSubject.value;
  }

  // Check specific permission
  hasPermission(menu: string, action: PermissionAction): boolean {
    const permissions = this.getUserPermissions();
    const menuPermission = permissions.find(p => p.menu === menu || p.menuName === menu);
    
    if (!menuPermission) return false;
    
    switch(action) {
      case 'read': 
        return menuPermission.read || menuPermission.canRead || false;
      case 'write': 
        return menuPermission.write || menuPermission.canWrite || false;
      case 'delete': 
        return menuPermission.delete || menuPermission.canDelete || false;
      default: 
        return false;
    }
  }
  // Add this method to check if user has ANY permission for a menu
hasAnyMenuAccess(): boolean {
  const menus = ['View Dashboard', 'Tasks', 'Reports', 'User Management', 'Configuration', 'Permissions'];
  return menus.some(menu => this.hasPermission(menu, 'read'));
}

// Get all permissions for current user
getAllPermissions(): Permission[] {
  return this.userPermissionsSubject.value;
}

// Check if user can edit permissions (only Admin)
canEditPermissions(): boolean {
  const user = this.getCurrentUser();
  return user?.role === 'Admin' || this.hasPermission('Permissions', 'write');
}

  // Check multiple permissions (any)
  hasAnyPermission(permissions: Array<{menu: string, action: PermissionAction}>): boolean {
    return permissions.some(p => this.hasPermission(p.menu, p.action));
  }

  // Check multiple permissions (all)
  hasAllPermissions(permissions: Array<{menu: string, action: PermissionAction}>): boolean {
    return permissions.every(p => this.hasPermission(p.menu, p.action));
  }

  // Get user role
  getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role || user?.registerRole || 'Member';
  }

  // Navigate based on user role
  private navigateByRole(role: string) {
    switch(role) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Manager':
        this.router.navigate(['admin/manager']);
        break;
      case 'Member':
        this.router.navigate(['admin/teammember']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  // Get auth token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = payload.exp * 1000 < Date.now();
      if (expired) {
        this.logout();
      }
      return expired;
    } catch {
      return true;
    }
  }
}