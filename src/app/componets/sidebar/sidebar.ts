import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/services/auth';
import { TaskService } from '@/services/taskServiceapi';
import { TenantService, Tenant } from '@/services/tenant.service';
import { ChangeDetectorRef } from '@angular/core';

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
  showNotifications = false;
  notifications: any[] = [];
  notificationError = '';
  isLoadingNotifications = false;
  private cd = inject(ChangeDetectorRef);

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
      path: '/admin/teams',
      icon: 'fa-solid fa-users-gear',
      label: 'Teams',
      color: 'blue',
      menuName: 'Teams'
    },
    {
      path: '/admin/configuration',
      icon: 'fa-solid fa-gear',
      label: 'Configuration',
      color: 'cyan',
      menuName: 'Configuration'
    },
    {
      path: '/admin/create-team',
      icon: 'fa-solid fa-user-plus',
      label: 'Create Team',
      color: 'teal',
      menuName: 'Team Management'
    },
    {
      path: '/admin/tenants',
      icon: 'fa-solid fa-building-user',
      label: 'Tenants',
      color: 'orange',
      menuName: 'Configuration'
    },
  ];

  visibleMenuItems: any[] = [];

  tenants: Tenant[] = [];
  selectedTenantId: number = 0;
  activeTenantName: string = 'All Tenants';

  constructor(
    private router: Router,
    public authService: AuthService,
    private taskService: TaskService,
    private tenantService: TenantService
  ) { }

  ngOnInit() {
    this.filterMenuItems();
    // Reload menus when permissions change
    this.authService.userPermissions$.subscribe(() => {
      this.filterMenuItems();
    });

    // Reactively load tenants when a Super Admin logs in
    this.authService.currentUser$.subscribe(user => {
      if (user && this.isSuperAdmin()) {
        this.loadTenants();
      }
    });

    // Load tenants list for super admin dropdown if already initialized
    if (this.isSuperAdmin()) {
      this.loadTenants();
    }

    // Subscribe to tenant selection changes
    this.tenantService.selectedTenantId$.subscribe(id => {
      this.selectedTenantId = id;
    });

    // Subscribe to the full tenant object to get the name reliably
    this.tenantService.selectedTenant$.subscribe(tenant => {
      this.activeTenantName = tenant ? tenant.name : 'All Tenants';
    });
  }

  loadTenants() {
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading tenants in sidebar:', err)
    });
  }

  onTenantChange(event: any) {
    const tenantId = Number(event.target.value);
    this.tenantService.setTenantId(tenantId);

    // Refresh the current page data
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  filterMenuItems() {
    this.visibleMenuItems = this.menuItems.filter(item => {
      if (item.label === 'Tenants') {
        return this.isSuperAdmin();
      }
      if (item.menuName === 'Teams') {
        return true;
      }
      const hasAccess = this.authService.hasPermission(item.menuName, 'read');
      return hasAccess;
    });
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

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  onBellIconClick() {
    if (this.showNotifications) {
      this.showNotifications = false;
      this.isLoadingNotifications = false;
      return;
    }

    this.showNotifications = true;
    this.notificationError = '';
    this.isLoadingNotifications = false;

    this.notifications = [
      {
        id: 1,
        userId: 19,
        message: "You have been assigned task: Test notification task",
        type: "TASK_ASSIGNMENT",
        isRead: 0,
        createdAt: "2026-04-22T07:38:05.000Z"
      }
    ];

    this.taskService.getNotifications().subscribe({
      next: (response) => {
        const apiNotifications = response.value || response || [];
        if (apiNotifications.length > 0) {
          this.notifications = apiNotifications;
        }
      },
      error: (error) => {
        console.error('API call failed, keeping sample data:', error);
      }
    });
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    return `${diffDays} day ago`;
  }

  trackByNotificationId(index: number, notification: any): number {
    return notification.id;
  }
}