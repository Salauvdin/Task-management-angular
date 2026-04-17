import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '@/services/task';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private taskService: TaskService) {}

  isEdit = false;
  editingUser: any = null;
  isLoading = false;

  formUser = {
    name: '',
    email: '',
    password: '',
    role: '',
    projects: ''
  };

  showPassword = false;
  isPasswordChanged = false;
  isEmailChecking = false;
  
  nameError = '';
  emailError = '';
  passwordError = '';
  roleError = '';

  permissions = [
    {
      section: 'DASHBOARD',
      items: [{ menu: 'View Dashboard', read: false, write: false, fullAccess: false }]
    },
    {
      section: 'TASK MANAGEMENT',
      items: [{ menu: 'Tasks', read: false, write: false, fullAccess: false }]
    },
    {
      section: 'REPORTS',
      items: [{ menu: 'Reports', read: false, write: false, fullAccess: false }]
    },
    {
      section: 'USER MANAGEMENT',
      items: [{ menu: 'User Management', read: false, write: false, fullAccess: false }]
    },
    {
      section: 'CONFIGURATION',
      items: [{ menu: 'Configuration', read: false, write: false, fullAccess: false }]
    },
    {
      section: 'PERMISSIONS',
      items: [{ menu: 'Permissions', read: false, write: false, fullAccess: false }]
    }
  ];

  ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    const state = history.state;
    
    // EDIT MODE - if user ID in route OR user data in state
    if (userId || state?.user) {
      this.isEdit = true;
      
      if (state?.user) {
        // User data passed via state
        this.editingUser = state.user;
        this.loadUserData(state.user);
      } else if (userId) {
        // Fetch user data from API by ID
        this.fetchUserById(userId);
      }
    } else {
      // CREATE MODE - Force ALL fields to be COMPLETELY EMPTY
      this.resetCreateForm();
    }
  }

  fetchUserById(userId: number) {
    this.isLoading = true;
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        let users = [];
        if (Array.isArray(res)) users = res;
        else if (res?.value && Array.isArray(res.value)) users = res.value;
        else if (res?.data && Array.isArray(res.data)) users = res.data;
        
        const user = users.find((u: any) => 
          (u.registerId === userId || u.userId === userId || u.id === userId)
        );
        
        if (user) {
          this.editingUser = user;
          this.loadUserData(user);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load user data');
      }
    });
  }

  loadUserData(user: any) {
    // Populate form with user data
    this.formUser = {
      name: user.userName || user.registerName || user.name || '',
      email: user.email || user.registerEmail || '',
      password: '', // Always empty for security
      role: user.userRole || user.registerRole || user.role || '',
      projects: user.projects || ''
    };
    
    // Load permissions
    if (user.permissions && user.permissions.length > 0) {
      this.loadPermissions(user.permissions);
    } else {
      // If no permissions in user object, fetch separately
      this.fetchUserPermissions(user.registerId || user.id);
    }
  }

  fetchUserPermissions(userId: number) {
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        let users = [];
        if (Array.isArray(res)) users = res;
        else if (res?.value && Array.isArray(res.value)) users = res.value;
        else if (res?.data && Array.isArray(res.data)) users = res.data;
        
        const user = users.find((u: any) => 
          (u.registerId === userId || u.userId === userId)
        );
        
        if (user && user.permissions) {
          this.loadPermissions(user.permissions);
        } else {
          this.setPermissionsByRole(this.formUser.role);
        }
      },
      error: () => {
        this.setPermissionsByRole(this.formUser.role);
      }
    });
  }

  resetCreateForm() {
    this.isEdit = false;
    this.editingUser = null;
    
    this.formUser = {
      name: '',
      email: '',
      password: '',
      role: '',
      projects: ''
    };
    
    this.resetAllPermissions();
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.roleError = '';
    this.isPasswordChanged = false;
    this.isEmailChecking = false;
    this.showPassword = false;
  }

  setPermissionsByRole(role: string) {
    console.log('Setting permissions for role:', role);
    this.resetAllPermissions();
    
    switch(role) {
      case 'Admin':
        this.permissions.forEach(section => {
          section.items.forEach(item => {
            item.read = true;
            item.write = true;
            item.fullAccess = true;
          });
        });
        break;
        
      case 'Manager':
        this.permissions.forEach(section => {
          section.items.forEach(item => {
            if (item.menu === 'View Dashboard' || item.menu === 'Tasks') {
              item.read = true;
              item.write = true;
              item.fullAccess = false;
            }
          });
        });
        break;
        
      case 'Member':
        this.permissions.forEach(section => {
          section.items.forEach(item => {
            if (item.menu === 'View Dashboard' || item.menu === 'Tasks') {
              item.read = true;
              item.write = false;
              item.fullAccess = false;
            }
          });
        });
        break;
        
      default:
        this.resetAllPermissions();
        break;
    }
  }

  resetAllPermissions() {
    this.permissions.forEach(section => {
      section.items.forEach(item => {
        item.read = false;
        item.write = false;
        item.fullAccess = false;
      });
    });
  }

  onRoleChange() {
    this.validateRole();
    // Only auto-set permissions in create mode, not in edit mode
    if (!this.isEdit) {
      this.setPermissionsByRole(this.formUser.role);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onPasswordChange() {
    this.isPasswordChanged = true;
    this.validatePassword();
  }

  validatePassword() {
    if (this.isEdit && !this.formUser.password) {
      this.passwordError = '';
      return true;
    }
    
    if (!this.formUser.password) {
      this.passwordError = 'Password is required';
      return false;
    } else if (this.formUser.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      return false;
    } else if (this.formUser.password.length > 20) {
      this.passwordError = 'Password must be less than 20 characters';
      return false;
    } else if (!/(?=.*[A-Z])/.test(this.formUser.password)) {
      this.passwordError = 'Password must contain at least one uppercase letter';
      return false;
    } else if (!/(?=.*[a-z])/.test(this.formUser.password)) {
      this.passwordError = 'Password must contain at least one lowercase letter';
      return false;
    } else if (!/(?=.*[0-9])/.test(this.formUser.password)) {
      this.passwordError = 'Password must contain at least one number';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.formUser.email) {
      this.emailError = 'Email is required';
      return false;
    } else if (!emailRegex.test(this.formUser.email)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    } else {
      this.emailError = '';
      return true;
    }
  }

  onEmailChange() {
    this.validateEmail();
    
    // Only check email uniqueness in create mode
    if (!this.isEdit && this.formUser.email && this.validateEmail() && !this.emailError) {
      this.checkEmailUniqueness(this.formUser.email);
    }
  }

  checkEmailUniqueness(email: string) {
    this.isEmailChecking = true;
    
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        let users = [];
        if (Array.isArray(res)) users = res;
        else if (res?.value && Array.isArray(res.value)) users = res.value;
        else if (res?.data && Array.isArray(res.data)) users = res.data;
        
        const emailExists = users.some((user: any) => 
          (user.registerEmail || user.email)?.toLowerCase() === email.toLowerCase()
        );
        
        if (emailExists) {
          this.emailError = 'Email already exists. Please use a different email';
        } else {
          this.emailError = '';
        }
        this.isEmailChecking = false;
      },
      error: () => {
        this.isEmailChecking = false;
      }
    });
  }

  validateName() {
    if (!this.formUser.name.trim()) {
      this.nameError = 'Name is required';
      return false;
    } else if (this.formUser.name.trim().length < 3) {
      this.nameError = 'Name must be at least 3 characters';
      return false;
    } else {
      this.nameError = '';
      return true;
    }
  }

  validateRole() {
    if (!this.formUser.role) {
      this.roleError = 'Please select a role';
      return false;
    } else {
      this.roleError = '';
      return true;
    }
  }

  isFormValid(): boolean {
    return this.validateName() && 
           this.validateEmail() && 
           (!this.emailError) &&
           this.validatePassword() && 
           this.validateRole();
  }

  loadPermissions(userPermissions: any[]) {
    console.log('Loading permissions for edit:', userPermissions);
    
    // Reset all permissions to false first
    this.resetAllPermissions();
    
    // Load existing permissions
    userPermissions.forEach(userPerm => {
      for (let section of this.permissions) {
        const item = section.items.find(i => i.menu === userPerm.menu);
        if (item) {
          // Handle different permission field names
          item.read = userPerm.read || userPerm.canRead || false;
          item.write = userPerm.write || userPerm.canWrite || false;
          item.fullAccess = userPerm.fullAccess || userPerm.canDelete || false;
          
          // If fullAccess is true, ensure read and write are also true
          if (item.fullAccess) {
            item.read = true;
            item.write = true;
          }
          break;
        }
      }
    });
    
    console.log('Loaded permissions state:', this.permissions);
  }

  getPermissionsPayload(): any[] {
    const permissionsPayload: any[] = [];
    this.permissions.forEach(section => {
      section.items.forEach(item => {
        permissionsPayload.push({
          section: section.section,
          menu: item.menu,
          read: item.read || false,
          write: item.write || false,
          fullAccess: item.fullAccess || false
        });
      });
    });
    return permissionsPayload;
  }

  onFullAccessChange(item: any) {
    if (item.fullAccess) {
      item.read = true;
      item.write = true;
    }
  }

  onReadWriteChange(item: any) {
    if (!item.read || !item.write) {
      item.fullAccess = false;
    }
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  saveUser() {
    if (!this.formUser.name || !this.formUser.email) {
      alert('Name and Email are required');
      return;
    }

    if (this.emailError) {
      alert(this.emailError);
      return;
    }

    if (!this.isEdit && !this.formUser.password) {
      alert('Password is required for new users');
      return;
    }

    if (!this.isFormValid()) {
      alert('Please fix validation errors before submitting');
      return;
    }

    const permissions = this.getPermissionsPayload();

    if (this.isEdit) {
      const payload: any = {
        userId: this.editingUser.registerId || this.editingUser.id,
        userName: this.formUser.name,
        email: this.formUser.email,
        userRole: this.formUser.role,
        projects: this.formUser.projects,
        permissions: permissions
      };
      
      if (this.isPasswordChanged && this.formUser.password) {
        payload.registerPassword = this.formUser.password;
      }
      
      console.log('Updating user payload:', payload);
      
      this.taskService.updateUserTask(payload).subscribe({
        next: () => {
          alert('User updated successfully');
          this.goBack();
        },
        error: (err) => {
          console.error('Update Error:', err);
          alert('Failed to update user: ' + (err.error?.message || err.message));
        }
      });
    } else {
      const payload = {
        userName: this.formUser.name,
        email: this.formUser.email,
        registerPassword: this.formUser.password,
        userRole: this.formUser.role,
        projects: this.formUser.projects || '',
        permissions: permissions
      };
      
      console.log('Creating user payload:', payload);
      
      this.taskService.addUserTask(payload).subscribe({
        next: () => {
          alert('User created successfully');
          this.goBack();
        },
        error: (err) => {
          console.error('Create Error:', err);
          alert('Failed to create user: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}