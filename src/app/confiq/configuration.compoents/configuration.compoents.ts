import { ZardCardComponent } from '@/shared/components/card';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '@/services/auth';
import { TimezoneService } from '@/services/timezone.service';
import { TaskService } from '@/services/taskServiceapi';

@Component({
  selector: 'app-configuration.components',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './configuration.components.html',
  styleUrls: ['./configuration.components.css'],
})
export class ConfigurationComponents implements OnInit, OnDestroy {
  collapsed = false;
  private timerSubscription?: Subscription;

  userProfile = {
    name: '',
    email: '',
    role: '',
    password: '',

    logo: '',
    timezone: 'IST',
    themeColor: '#1E40AF'
  };

  // Timezone options from service
  timezones: any[] = [];

  constructor(
    private authService: AuthService,
    private timezoneService: TimezoneService,
    private taskService: TaskService
  ) {
    this.timezones = this.timezoneService.getTimezoneOptions();
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.startClock();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  startClock() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentDate = new Date();
    });
  }

  loadCurrentUser() {
    const loggedInUserId = this.authService.getLoggedInUserId();

    if (loggedInUserId) {
      this.taskService.getUserTasks().subscribe({
        next: (res: any) => {
          const users = Array.isArray(res) ? res : (res.data || res.value || []);
          // Use loose equality to match string/number IDs
          const user = users.find((u: any) => (u.registerId || u.userId || u.id) == loggedInUserId);

          if (user) {
            this.userProfile.name = user.registerName || user.userName || user.name || '';
            this.userProfile.email = user.registerEmail || user.email || '';
            this.userProfile.role = user.registerRole || user.userRole || user.role || '';
            this.userProfile.logo = user.image || user.logo || '';
            this.userProfile.timezone = user.timezone || this.timezoneService.getUserTimezone();

            // Sync timezone service with backend value if available
            if (user.timezone) {
              this.timezoneService.setUserTimezone(user.timezone);
            }
          } else {
            this.loadFromLocal();
          }
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
          this.loadFromLocal();
        }
      });
    } else {
      this.loadFromLocal();
    }
  }

  private loadFromLocal() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userProfile.name = user.name || (user as any).userName || user.registerName || '';
      this.userProfile.email = user.email || user.registerEmail || '';
      this.userProfile.role = user.role || (user as any).userRole || user.registerRole || '';
      // We might not get the password directly, but we can set it if available
      this.userProfile.password = (user as any).password || (user as any).registerPassword || '';
      this.userProfile.logo = (user as any).logo || (user as any).image || '';
      this.userProfile.timezone = (user as any).timezone || this.timezoneService.getUserTimezone();
    }
  }
  // Update logo from file input
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

  saveProfile() {
    const currentUser = this.authService.getCurrentUser() as any;
    const userId = currentUser?.registerId || currentUser?.userId || currentUser?.id;

    if (!userId) {
      alert('User not found');
      return;
    }






    const payload: any = {
      registerId: userId,
      registerName: this.userProfile.name,
      registerEmail: this.userProfile.email,
      registerRole: this.userProfile.role,
      timezone: this.userProfile.timezone
    };

    if (this.userProfile.password) {
      payload.registerPassword = this.userProfile.password;
    }

    this.taskService.updateUserTask(payload).subscribe({
      next: (res: any) => {
        this.timezoneService.setUserTimezone(this.userProfile.timezone);

        const updatedUser = {
          ...currentUser,
          registerId: userId,
          name: this.userProfile.name,
          email: this.userProfile.email,
          role: this.userProfile.role,
          registerName: this.userProfile.name,
          registerEmail: this.userProfile.email,
          registerRole: this.userProfile.role,
          timezone: this.userProfile.timezone
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        console.log('Profile updated successfully:', res);
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert(err?.error?.message || 'Failed to update profile. Please try again.');
      }
    });
  }

  // Use timezone service methods
  getCurrentTimeInTimezone(timezone: string): string {
    return this.timezoneService.formatTimeOnly(this.currentDate, timezone);
  }

  getTimezoneOffset(timezone: string): string {
    return this.timezoneService.getTimezoneOffset(timezone);
  }
  // Add these properties
  showPassword = false;

  currentDate = new Date();

  // Add password strength methods
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
    switch (strength) {
      case 'strong': return 'Strong password';
      case 'medium': return 'Medium strength password';
      case 'weak': return 'Weak password';
    }
  }
  get userInitial(): string {
    return this.userProfile?.name?.charAt(0) || 'U';
  }
  // Add reset method
  resetForm() {
    this.loadCurrentUser();
  }

  onTimezoneChange() {
    this.timezoneService.setUserTimezone(this.userProfile.timezone);
    console.log('Timezone updated live:', this.userProfile.timezone);
  }
}
