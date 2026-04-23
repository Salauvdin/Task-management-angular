import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIdDirective } from '@/shared/core';
import { AuthService } from '@/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardIdDirective
  ],
  templateUrl: './login.html'
})
export class Login {

  email = 'admin@example.com';  // ✅ Default admin email
  password = 'Admin@123';       // ✅ Default admin password
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ✅ Method to set default admin credentials
  setAdminCredentials() {
    this.email = 'admin@example.com';
    this.password = 'Admin@123';
    this.errorMessage = '';
  }

  // ✅ Method to set demo user credentials
  setDemoUserCredentials() {
    this.email = 'user@example.com';
    this.password = 'User@123';
    this.errorMessage = '';
  }

  async login() {
    this.errorMessage = '';

    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      alert(this.errorMessage);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Invalid email format';
      alert(this.errorMessage);
      return;
    }

    this.isLoading = true;

    try {
      const res: any = await firstValueFrom(
        this.authService.loginUser({
          email: this.email,
          password: this.password
        })
      );

      console.log("Login Success:",);

      // Store token and user data
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        // Redirect based on role
        if (res.user?.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }

    } catch (err: any) {
      console.error(err);

      if (err.status === 401) {
        this.errorMessage = 'Invalid email or password';
      } else if (err.status === 0) {
        this.errorMessage = 'Server not running. Please make sure backend is running on port 3000';
      } else if (err.status === 404) {
        this.errorMessage = 'Login endpoint not found. Please check API configuration';
      } else {
        this.errorMessage = err?.error?.message || "Login failed";
      }

      alert(this.errorMessage);

    } finally {
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}