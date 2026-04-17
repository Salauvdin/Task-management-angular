import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
// import { ZardIdDirective } from '@/shared/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '@/services/task';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  imports: [ZardCardComponent,RouterModule, FormsModule, CommonModule]
})
export class Register {
  name = '';
  email = '';
  password = '';
  role = '';
  showPassword = false;
  isLoading = false;

  // Validation errors
  nameError = '';
  emailError = '';
  passwordError = '';
  roleError = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validateName(): boolean {
    if (!this.name.trim()) {
      this.nameError = 'Name is required';
      return false;
    } else if (this.name.trim().length < 3) {
      this.nameError = 'Name must be at least 3 characters';
      return false;
    } else if (this.name.trim().length > 50) {
      this.nameError = 'Name must be less than 50 characters';
      return false;
    }
    this.nameError = '';
    return true;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'Email is required';
      return false;
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address (e.g., name@example.com)';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      return false;
    } else if (this.password.length > 20) {
      this.passwordError = 'Password must be less than 20 characters';
      return false;
    } else if (!/(?=.*[A-Z])/.test(this.password)) {
      this.passwordError = 'Password must contain at least one uppercase letter';
      return false;
    } else if (!/(?=.*[a-z])/.test(this.password)) {
      this.passwordError = 'Password must contain at least one lowercase letter';
      return false;
    } else if (!/(?=.*[0-9])/.test(this.password)) {
      this.passwordError = 'Password must contain at least one number';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  validateRole(): boolean {
    if (!this.role) {
      this.roleError = 'Please select a role';
      return false;
    }
    this.roleError = '';
    return true;
  }

  isFormValid(): boolean {
    // Run all — don't short-circuit so all errors show at once
    const name = this.validateName();
    const email = this.validateEmail();
    const password = this.validatePassword();
    const role = this.validateRole();
    return name && email && password && role;
  }

  register() {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fix all validation errors before submitting';
      return; // ✅ No alert — errors shown inline in template
    }

    this.isLoading = true;

    // ✅ Field names match exactly what backend Service.js expects
    const registerData = {
      registerName: this.name.trim(),
      registerEmail: this.email.trim().toLowerCase(),
      registerPassword: this.password,
      registerRole: this.role
    };

    console.log('Sending registration data:', registerData);

    this.taskService.registerUser(registerData).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Registration failed:', error);
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please make sure backend is running on port 3000.';
        } else if (error.status === 409) {
          this.errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.status === 400) {
          // ✅ Now shows the actual backend validation message
          this.errorMessage = error.error?.message || 'Invalid data. Please check your inputs.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}