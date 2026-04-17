import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  collapsed: boolean = false;
  
  // All menu items with their required permissions
  menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: 'fa-solid fa-chart-line', 
      label: 'Dashboard',
      color: 'indigo',
      menuName: 'View Dashboard'
    },
    { 
      path: '/admin/tasks', 
      icon: 'fa-solid fa-list-check', 
      label: 'Tasks',
      color: 'emerald',
      menuName: 'Tasks'
    },
    { 
      path: '/admin/reports', 
      icon: 'fa-solid fa-chart-pie', 
      label: 'Reports',
      color: 'purple',
      menuName: 'Reports'
    },
    { 
      path: '/admin/users', 
      icon: 'fa-solid fa-users', 
      label: 'Users',
      color: 'amber',
      menuName: 'User Management'
    },
    { 
      path: '/admin/configuration', 
      icon: 'fa-solid fa-gear', 
      label: 'Configuration',
      color: 'cyan',
      menuName: 'Configuration'
    },
    { 
      path: '/admin/permissions', 
      icon: 'fa-solid fa-shield-halved', 
      label: 'Permissions',
      color: 'pink',
      menuName: 'Permissions'
    }
  ];

  visibleMenuItems: any[] = [];

  // Make authService public for template if needed
  constructor(
    private router: Router,
    public authService: AuthService  // Changed to public
  ) {}

  ngOnInit() {
    this.filterMenuItems();
    // Reload menus when permissions change
    this.authService.userPermissions$.subscribe(() => {
      this.filterMenuItems();
    });
  }

  filterMenuItems() {
    this.visibleMenuItems = this.menuItems.filter(item => {
      const hasAccess = this.authService.hasPermission(item.menuName, 'read');
      console.log(`Menu ${item.label}: hasPermission = ${hasAccess}`);
      return hasAccess;
    });
    console.log('Visible menus:', this.visibleMenuItems.map(m => m.label));
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.registerName || 'Admin User';
  }

  getCurrentUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || user?.registerEmail || 'admin@site.com';
  }
  
  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }
}