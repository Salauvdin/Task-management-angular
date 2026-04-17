import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { TaskService } from '@/services/task';

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

  constructor(private taskService: TaskService) {}

  users: any[] = [];
  filteredUsers: any[] = [];
  searchText: string = '';

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
      // Use registerId as the ID since backend uses that
      const userId = user.registerId || user.id;
      this.router.navigate(['/admin/users/edit', userId], { state: { user } });
    } else {
      this.router.navigate(['/admin/users/create']);
    }
  }

  getAllUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        console.log('API Response:', res); // Debug log
        
        let data = [];
        
        // Handle different response structures
        if (Array.isArray(res)) {
          data = res;
        } else if (res?.value && Array.isArray(res.value)) {
          data = res.value;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.users && Array.isArray(res.users)) {
          data = res.users;
        } else {
          // If response is an object with keys, try to convert
          console.log('Unexpected response format:', res);
          data = [];
        }
        
        console.log('Processed data:', data); // Debug log
        
        // Map the data to match the component's expected format
        this.users = data.map((u: any) => ({
          id: u.registerId || u.userId || u._id || u.id,
          registerId: u.registerId,
          name: u.registerName || u.userName || u.name,
          userName: u.registerName || u.userName,
          email: u.registerEmail || u.email,
          role: u.registerRole || u.userRole || u.role,
          password: u.registerPassword,
          projects: u.projects || 'No projects',
          permissions: u.permissions || []
        }));
        
        this.filteredUsers = [...this.users];
        this.updatePagination();
        this.isLoading = false;
        this.cd.detectChanges();
        
        if (this.users.length === 0) {
          console.log('No users found in response');
        }
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
    const userId = user.registerId || user.id;
    this.taskService.deleteUserTask(userId).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.getAllUsers(); // Refresh the list
      },
      error: (err) => {
        console.error('Delete Error:', err);
        this.errorMessage = err.error?.message || 'Failed to delete user';
        this.cd.detectChanges();
      }
    });
  }

  showDialog(user: any) {
    this.alertDialogService.confirm({
      zTitle: 'Delete User',
      zDescription: `Are you sure you want to delete "${user.name}"?`,
      zCancelText: 'Cancel',
      zOkText: 'Delete',
      zCustomClasses: 'delete-dialog',
      zOnOk: () => this.deleteUser(user)
    });
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