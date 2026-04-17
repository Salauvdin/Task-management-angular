// Shared form model for Register and User Form
export interface FormUser {
  name: string;
  email: string;
  password: string;
  role: string;
  projects?: string;
}

export interface ValidationErrors {
  nameError: string;
  emailError: string;
  passwordError: string;
  roleError: string;
}

export class FormValidation {
  // Password validation (same for both)
  static validatePassword(password: string): string {
    if (!password) {
      return 'Password is required';
    } else if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    } else if (password.length > 20) {
      return 'Password must be less than 20 characters';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[0-9])/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  }

  // Email validation (same for both)
  static validateEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  // Name validation (same for both)
  static validateName(name: string, minLength: number = 3, maxLength: number = 50): string {
    if (!name?.trim()) {
      return 'Name is required';
    } else if (name.trim().length < minLength) {
      return `Name must be at least ${minLength} characters`;
    } else if (name.trim().length > maxLength) {
      return `Name must be less than ${maxLength} characters`;
    }
    return '';
  }

  // Role validation (same for both)
  static validateRole(role: string): string {
    if (!role) {
      return 'Please select a role';
    }
    return '';
  }
}
