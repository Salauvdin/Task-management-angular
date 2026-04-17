import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIdDirective } from '@/shared/core';
import { AuthService } from '@/services/auth';  // ✅ Import AuthService, not TaskService

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

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService  // ✅ Use AuthService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {

    console.log("LOGIN CLICKED 🚀");

    this.errorMessage = '';

    // ✅ VALIDATION
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
      // ✅ Use AuthService loginUser method
      const res: any = await firstValueFrom(
        this.authService.loginUser({
          email: this.email,
          password: this.password
        })
      );

      console.log("Login Success:", res);

      // ✅ STORE TOKEN AND USER (AuthService already does this, but let's ensure)
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      // alert(`Welcome ${res.user.name || res.user.registerName}`);

      // ✅ ROLE BASED ROUTING
      const userRole = res.user.role || res.user.registerRole;
      
      switch (userRole) {
        case 'Admin':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'Manager':
          this.router.navigate(['/manager']);
          break;
        case 'Member':
          this.router.navigate(['/teammember']);
          break;
        default:
          this.router.navigate(['/admin/dashboard']);
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