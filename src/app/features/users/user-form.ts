import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@/services/auth';
import { TaskService } from '@/services/taskServiceapi';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  isEdit = false;
  editingUser: any = null;

  showPassword = false;
  isPasswordChanged = false;
  isEmailChecking = false; // ✅ FIXED ERROR

  formUser = {
    name: '',
    email: '',
    password: '',
    role: '',
    projects: ''
  };

  nameError = '';
  emailError = '';
  passwordError = '';
  roleError = '';

  permissions = [
    { section: 'DASHBOARD', items: [{ menu: 'View Dashboard', read: false, write: false, fullAccess: false }] },
    { section: 'TASK MANAGEMENT', items: [{ menu: 'Tasks', read: false, write: false, fullAccess: false }] },
    { section: 'REPORTS', items: [{ menu: 'Reports', read: false, write: false, fullAccess: false }] },
    { section: 'USER MANAGEMENT', items: [{ menu: 'User Management', read: false, write: false, fullAccess: false }] },
    { section: 'CONFIGURATION', items: [{ menu: 'Configuration', read: false, write: false, fullAccess: false }] },
    { section: 'PERMISSIONS', items: [{ menu: 'Permissions', read: false, write: false, fullAccess: false }] },
  ];

  ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    const navUser = history.state?.user;

    if (userId) {
      this.isEdit = true;

      // Prefer navigation state data for immediate render in edit mode.
      if (navUser) {
        this.populateFormFromUser(navUser);
      } else {
        this.fetchUserById(userId);
      }
    }
  }

  // ✅ FIXED ERROR
  fetchUserById(userId: number) {
    this.taskService.getUserTasks().subscribe((res: any) => {
      const users = this.extractUsersFromResponse(res);
      const user = users.find((u: any) => {
        const currentId = u.registerId ?? u.userId ?? u.id;
        return Number(currentId) === Number(userId);
      });

      if (user) {
        this.populateFormFromUser(user);
      }
    });
  }

  private populateFormFromUser(user: any): void {
    this.editingUser = user;
    this.formUser = {
      name: user.registerName || user.userName || user.name || '',
      email: user.registerEmail || user.email || '',
      password: '',
      role: user.registerRole || user.userRole || user.role || '',
      projects: user.projects || ''
    };

    this.applyPermissions(user.permissions || []);
  }

  private extractUsersFromResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.value)) return res.value;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.users)) return res.users;
    return [];
  }

  private applyPermissions(apiPermissions: any[]): void {
    const permissionMap = new Map<string, any>();
    apiPermissions.forEach((permission: any) => {
      const key = permission.menu || permission.menuName;
      if (key) {
        permissionMap.set(key, permission);
      }
    });

    this.permissions.forEach((section) => {
      section.items.forEach((item) => {
        const apiPermission = permissionMap.get(item.menu);
        if (!apiPermission) {
          item.read = false;
          item.write = false;
          item.fullAccess = false;
          return;
        }

        item.read = this.toBoolean(apiPermission.read ?? apiPermission.canRead);
        item.write = this.toBoolean(apiPermission.write ?? apiPermission.canWrite);
        item.fullAccess = this.toBoolean(apiPermission.fullAccess ?? apiPermission.delete ?? apiPermission.canDelete);
      });
    });
  }

  private toBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    return false;
  }

  // ================= VALIDATIONS =================

  validateName() {
    if (!this.formUser.name.trim()) {
      this.nameError = 'Name is required';
      return false;
    }
    this.nameError = '';
    return true;
  }

  validateEmail() {
    if (!this.formUser.email) {
      this.emailError = 'Email required';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword() {
    if (this.isEdit && !this.isPasswordChanged) {
      this.passwordError = '';
      return true;
    }

    if (!this.formUser.password) {
      this.passwordError = 'Password required';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  validateRole() {
    if (!this.formUser.role) {
      this.roleError = 'Role required';
      return false;
    }
    this.roleError = '';
    return true;
  }

  // ✅ FIXED ERROR
  onEmailChange() {
    this.validateEmail();
  }

  // ✅ FIXED ERROR
  onPasswordChange() {
    this.isPasswordChanged = true;
    this.validatePassword();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ================= PERMISSIONS =================

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

  getPermissionsPayload() {
    const data: any[] = [];

    this.permissions.forEach(section => {
      section.items.forEach(item => {
        data.push({
          section: section.section,
          menu: item.menu,
          read: item.read,
          write: item.write,
          fullAccess: item.fullAccess
        });
      });
    });

    return data;
  }

  // ================= SAVE =================

  saveUser() {

    if (
      !this.validateName() ||
      !this.validateEmail() ||
      !this.validatePassword() ||
      !this.validateRole()
    ) {
      alert('Fill all required fields');
      return;
    }

    const normalizedName = this.formUser.name?.trim();
    const normalizedEmail = this.formUser.email?.trim().toLowerCase();
    const normalizedRole = this.formUser.role;

    const payload: any = {
      // Send both naming styles to support strict backend validation paths.
      userName: normalizedName,
      email: normalizedEmail,
      userRole: normalizedRole,
      registerName: normalizedName,
      registerEmail: normalizedEmail,
      registerRole: normalizedRole,
      projects: this.formUser.projects,
      permissions: this.getPermissionsPayload()
    };

    if (this.isEdit) {
      payload.userId = this.editingUser?.id ?? this.editingUser?.registerId ?? this.editingUser?.userId;

      this.taskService.updateUserTask(payload).subscribe(() => {
        alert('User Updated');
        this.goBack();
      });

    } else {
      payload.registerPassword = this.formUser.password;

      this.taskService.addUserTask(payload).subscribe((res: any) => {
        alert('User Created');
        console.log('New user created:', res);
        
        // Clear existing cache and set refresh flag
        localStorage.removeItem('cachedUsers');
        localStorage.setItem('userCreated', 'true');
        
        // Add new user to cache immediately for instant availability
        const cachedUsers = localStorage.getItem('cachedUsers');
        if (cachedUsers) {
          const users = JSON.parse(cachedUsers);
          users.push({
            registerId: res.registerId || res.userId,
            registerName: res.registerName || res.userName,
            registerEmail: res.registerEmail || res.email
          });
          localStorage.setItem('cachedUsers', JSON.stringify(users));
          console.log('Added new user to cache:', res.registerName);
        }
        
        this.goBack();
      });
    }
  }
onRoleChange() {
  this.validateRole();
  this.setPermissionsByRole(this.formUser.role);
}

private setPermissionsByRole(role: string): void {
  console.log('Setting permissions for role:', role);
  
  this.permissions.forEach(section => {
    section.items.forEach(item => {
      switch (role) {
        case 'Admin':
          // Admin gets all permissions
          item.read = true;
          item.write = true;
          item.fullAccess = true;
          break;
          
        case 'Manager':
          // Manager gets read and write for most sections, but not full access
          item.read = true;
          item.write = true;
          item.fullAccess = section.section === 'DASHBOARD' || section.section === 'TASK MANAGEMENT';
          break;
          
        case 'Member':
          // Member gets read-only access
          item.read = true;
          item.write = false;
          item.fullAccess = false;
          break;
          
        default:
          // Default to no permissions
          item.read = false;
          item.write = false;
          item.fullAccess = false;
          break;
      }
    });
  });
  
  console.log('Updated permissions:', this.getPermissionsPayload());
}
  goBack() {
    this.router.navigate(['/admin/users']);
  }
}