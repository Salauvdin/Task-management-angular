import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/services/auth';
import { TaskService } from '@/services/taskServiceapi';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  userProfile = {
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
    address: '',
    logo: '',
    timezone: 'IST',
    themeColor: '#1E40AF'
  };

  showPassword = false;
  showConfirmPassword = false;
  currentDate = new Date();
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Timezone options
  timezones = [
    { value: 'IST', label: 'Indian Standard Time (IST)', offset: '+5:30' },
    { value: 'EST', label: 'Eastern Standard Time (EST)', offset: '-5:00' },
    { value: 'PST', label: 'Pacific Standard Time (PST)', offset: '-8:00' },
    { value: 'CST', label: 'Central Standard Time (CST)', offset: '-6:00' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: '+0:00' }
  ];

  constructor(
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile.name = currentUser.name || currentUser.registerName || '';
      this.userProfile.email = currentUser.email || currentUser.registerEmail || '';
      this.userProfile.role = currentUser.role || currentUser.registerRole || '';
      this.userProfile.phone = (currentUser as any).phone || '';
      this.userProfile.address = (currentUser as any).address || '';
      this.userProfile.logo = (currentUser as any).logo || '';
      this.userProfile.timezone = (currentUser as any).timezone || 'IST';
    }
  }

  get userInitial(): string {
    return this.userProfile?.name?.charAt(0) || 'U';
  }

  updateLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userProfile.logo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Password strength methods
  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.userProfile.password;
    if (!password) return 'weak';
    
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    
    // Check for complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const complexity = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (complexity >= 3) return 'strong';
    if (complexity >= 2) return 'medium';
    return 'weak';
  }

  getPasswordStrengthMessage(): string {
    const strength = this.getPasswordStrength();
    switch(strength) {
      case 'strong': return 'Strong password';
      case 'medium': return 'Medium strength password';
      case 'weak': return 'Weak password';
    }
  }

  // Timezone conversion methods
  getCurrentTimeInTimezone(timezone: string): string {
    const now = new Date();
    
    switch(timezone) {
      case 'IST':
        return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString();
      case 'EST':
        return new Date(now.getTime() - (5 * 60 * 60 * 1000)).toLocaleTimeString();
      case 'PST':
        return new Date(now.getTime() - (8 * 60 * 60 * 1000)).toLocaleTimeString();
      case 'CST':
        return new Date(now.getTime() - (6 * 60 * 60 * 1000)).toLocaleTimeString();
      case 'UTC':
        return now.toUTCString();
      default:
        return now.toLocaleTimeString();
    }
  }

  getTimezoneOffset(timezone: string): string {
    const tz = this.timezones.find(t => t.value === timezone);
    return tz ? tz.offset : '+0:00';
  }

  // Form validation
  validateForm(): boolean {
    if (!this.userProfile.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    
    if (!this.userProfile.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userProfile.email)) {
      this.errorMessage = 'Invalid email format';
      return false;
    }
    
    if (this.userProfile.password && this.userProfile.password !== this.userProfile.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  saveProfile() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    const profileData = {
      ...this.userProfile,
      // Only include password if it's changed
      ...(this.userProfile.password && { password: this.userProfile.password })
    };

    // Update user profile - Using existing API for now
    this.taskService.updateUserTask(profileData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Update local storage with new user data
        const updatedUser = {
          ...this.authService.getCurrentUser(),
          ...profileData
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Clear password fields after successful save
        this.userProfile.password = '';
        this.userProfile.confirmPassword = '';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  resetForm() {
    this.loadUserProfile();
    this.userProfile.password = '';
    this.userProfile.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePassword(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
