import { ZardCardComponent } from '@/shared/components/card';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-configuration.components',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './configuration.components.html',
  styleUrls: ['./configuration.components.css'],
})
export class ConfigurationComponents {
  collapsed = false; 
  // optional: control sidebar collapse

  // User profile
  userProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '',
  role: '',
  password: '',
  confirmPassword: '',
  address: '',
  logo: '',
  themeColor: '#1E40AF'
};
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
    console.log('Profile saved', this.userProfile);
    alert('Profile updated!');
  }
  // Add these properties
showPassword = false;
showConfirmPassword = false;
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
  switch(strength) {
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
  // Reset to original values or clear
  // Implement based on your requirements
}
}