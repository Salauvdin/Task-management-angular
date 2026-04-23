import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { AuthService } from '@/services/auth';
import { TaskService } from '@/services/taskServiceapi';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private alertDialogService = inject(ZardAlertDialogService);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  users: any[] = [];
  filteredUsers: any[] = [];
  searchText: string = '';
  allUsersMap: Map<number, string> = new Map();

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  Math = Math;
  
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.getAllUsers();
  }

  openUserForm(user?: any) {
    if (user) {
      const loggedInUserId = this.authService.getLoggedInUserId();
      const userRole = this.authService.getUserRole();
      const userId = user.registerId || user.id;
      const createdBy = user.createdBy;
      
      if (userRole !== 'Admin' && Number(createdBy) !== loggedInUserId && Number(userId) !== loggedInUserId) {
        this.alertDialogService.confirm({
          zTitle: 'Access Denied',
          zDescription: 'You do not have permission to edit this user',
          zOkText: 'OK',
          zCancelText: '',
          zOnOk: () => {}
        });
        return;
      }
      
      this.router.navigate(['/admin/users/edit', userId], { state: { user } });
    } else {
      this.router.navigate(['/admin/users/create']);
    }
  }

  getAllUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    const loggedInUserId = this.authService.getLoggedInUserId();
    
    console.log('Current user - ID:', loggedInUserId, 'Role:', this.authService.getUserRole());
    
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        
        let data = [];
        
        if (Array.isArray(res)) {
          data = res;
        } else if (res?.value && Array.isArray(res.value)) {
          data = res.value;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.users && Array.isArray(res.users)) {
          data = res.users;
        } else {
          console.log('Unexpected response format:', res);
          data = [];
        }
        
        console.log('All users from API:', data);
        
        // Build map of user IDs to names
        data.forEach((user: any) => {
          const userId = user.registerId || user.userId || user.id;
          const userName = user.registerName || user.userName || user.name;
          if (userId && userName) {
            this.allUsersMap.set(Number(userId), userName);
          }
        });
        
        let scopedData = data;
        
        // Show only self and users created by currently logged-in user.
        if (loggedInUserId) {
          scopedData = data.filter((u: any) => {
            const registerId = u.registerId ?? u.userId ?? u.id;
            const createdBy = u.createdBy ?? u.CreatedBy;
            
            const canAccess = Number(registerId) === Number(loggedInUserId) || 
                             Number(createdBy) === Number(loggedInUserId);
            
            if (!canAccess) {
              console.log(`User ${loggedInUserId} cannot access user ${registerId} (createdBy: ${createdBy})`);
            }
            return canAccess;
          });
        }
        
        // Map the data
        this.users = scopedData.map((u: any) => ({
          id: u.registerId || u.userId || u._id || u.id,
          registerId: u.registerId,
          name: u.registerName || u.userName || u.name,
          userName: u.registerName || u.userName,
          email: u.registerEmail || u.email,
          role: u.registerRole || u.userRole || u.role,
          password: u.registerPassword,
          projects: u.projects || 'No projects',
          createdBy: u.createdBy ?? u.CreatedBy ?? null,
          permissions: u.permissions || []
        }));
        
        console.log('Processed users:', this.users);
        
        this.filteredUsers = [...this.users];
        this.updatePagination();
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('GET Error:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load users. Please try again.';
        this.cd.detectChanges();
      }
    });
  }

  deleteUser(user: any) {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const userRole = this.authService.getUserRole();
    const userId = user.registerId || user.id;
    const createdBy = user.createdBy;
    
    // Check permission to delete
    if (userRole !== 'Admin' && Number(createdBy) !== Number(loggedInUserId)) {
      this.alertDialogService.confirm({
        zTitle: 'Access Denied',
        zDescription: 'You do not have permission to delete this user',
        zOkText: 'OK',
        zCancelText: '',
        zOnOk: () => {}
      });
      return;
    }
    
    // Prevent self-deletion
    if (Number(userId) === Number(loggedInUserId)) {
      this.alertDialogService.confirm({
        zTitle: 'Cannot Delete',
        zDescription: 'You cannot delete your own account',
        zOkText: 'OK',
        zCancelText: '',
        zOnOk: () => {}
      });
      return;
    }
    
    this.taskService.deleteUserTask(userId).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.alertDialogService.confirm({
          zTitle: 'Success',
          zDescription: 'User deleted successfully',
          zOkText: 'OK',
          zCancelText: '',
          zOnOk: () => {}
        });
        this.getAllUsers();
      },
      error: (err) => {
        console.error('Delete Error:', err);
        this.errorMessage = err.error?.message || 'Failed to delete user';
        this.cd.detectChanges();
      }
    });
  }

  showDialog(user: any) {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const userRole = this.authService.getUserRole();
    const createdBy = user.createdBy;
    
    if (userRole !== 'Admin' && Number(createdBy) !== Number(loggedInUserId)) {
      this.alertDialogService.confirm({
        zTitle: 'Access Denied',
        zDescription: 'You do not have permission to delete this user',
        zOkText: 'OK',
        zCancelText: '',
        zOnOk: () => {}
      });
      return;
    }
    
    this.alertDialogService.confirm({
      zTitle: 'Delete User',
      zDescription: `Are you sure you want to delete "${user.name}"?`,
      zCancelText: 'Cancel',
      zOkText: 'Delete',
      zCustomClasses: 'delete-dialog',
      zOnOk: () => this.deleteUser(user)
    });
  }

  getCreatedByName(createdBy: number): string {
    if (!createdBy) return 'System';
    const name = this.allUsersMap.get(Number(createdBy));
    return name || `User ID: ${createdBy}`;
  }

  filterUsers() {
    if (!this.searchText) {
      this.filteredUsers = [...this.users];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.projects?.toLowerCase().includes(search)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  getPaginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cd.detectChanges();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getUserCountByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }

  getStartIndex(): number { 
    return this.filteredUsers.length > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }
  
  getEndIndex(): number { 
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
  }
  
  refreshUsers() {
    this.getAllUsers();
  }
}