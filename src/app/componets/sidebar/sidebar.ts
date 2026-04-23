import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/services/auth';
import { TaskService } from '@/services/taskServiceapi';

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
  ];

  visibleMenuItems: any[] = [];

  // Make authService public for template if needed
  constructor(
    private router: Router,
    public authService: AuthService,
    private taskService: TaskService
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
      // Show Teams without permission check for now
      if (item.menuName === 'Teams') {
        // console.log(`Menu ${item.label}: Teams - showing without permission check`);
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
  
  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  // Call notification API when bell icon is clicked
  onBellIconClick() {
    console.log('Bell icon clicked - calling notification API...');
    
    // Toggle notification panel visibility
    if (this.showNotifications) {
      this.showNotifications = false;
      this.isLoadingNotifications = false;
      return;
    }
    
    // Show notification panel immediately with sample data
    this.showNotifications = true;
    this.notificationError = '';
    this.isLoadingNotifications = false;
    
    // Add sample notification data for immediate display
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
    
    console.log('Notifications displayed immediately:', this.notifications.length);
    
    // Also call API in background to update with real data
    this.taskService.getNotifications().subscribe({
      next: (response) => {
        console.log('API Response received:', response);
        const apiNotifications = response.value || response || [];
        if (apiNotifications.length > 0) {
          this.notifications = apiNotifications;
          console.log('Updated with real notifications:', this.notifications.length);
        }
      },
      error: (error) => {
        console.error('API call failed, keeping sample data:', error);
      }
    });
  }

  // Close notification panel
  closeNotifications() {
    this.showNotifications = false;
  }

  // Format notification time
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

  // Track by notification ID for better performance
  trackByNotificationId(index: number, notification: any): number {
    return notification.id;
  }
}