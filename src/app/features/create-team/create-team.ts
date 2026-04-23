import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '@/services/taskServiceapi';
import { AuthService } from '@/services/auth';
import { SidebarComponent } from '@/componets/sidebar/sidebar';
import { TeamMemberComponent } from '../team-member/team-member';

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  isValid: boolean;
}

interface TeamForm {
  name: string;
  description: string;
  members: TeamMember[];
}

@Component({
  selector: 'app-create-team',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    TeamMemberComponent
  ],
  templateUrl: './create-team.html',
  styleUrl: './create-team.css'
})
export class CreateTeamComponent implements OnInit {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  teamForm: TeamForm = {
    name: '',
    description: '',
    members: []
  };

  memberEmail: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Form validation
  nameError: string = '';
  descriptionError: string = '';
  memberEmailError: string = '';

  ngOnInit() {
    console.log('Create Team Component initialized');
  }

  // Navigation
  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  // Form validation methods
  validateTeamName(): boolean {
    if (!this.teamForm.name.trim()) {
      this.nameError = 'Team name is required';
      return false;
    }
    if (this.teamForm.name.trim().length < 3) {
      this.nameError = 'Team name must be at least 3 characters';
      return false;
    }
    this.nameError = '';
    return true;
  }

  validateTeamDescription(): boolean {
    if (!this.teamForm.description.trim()) {
      this.descriptionError = 'Team description is required';
      return false;
    }
    if (this.teamForm.description.trim().length < 10) {
      this.descriptionError = 'Team description must be at least 10 characters';
      return false;
    }
    this.descriptionError = '';
    return true;
  }

  validateMemberEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.memberEmail.trim()) {
      this.memberEmailError = '';
      return true; // Empty email is ok (just don't add member)
    }
    
    if (!emailRegex.test(this.memberEmail)) {
      this.memberEmailError = 'Please enter a valid email address';
      return false;
    }
    
    // Check for duplicate emails
    const isDuplicate = this.teamForm.members.some(
      member => member.email.toLowerCase() === this.memberEmail.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      this.memberEmailError = 'This email is already added to the team';
      return false;
    }
    
    this.memberEmailError = '';
    return true;
  }

  // Team member management
  addMember() {
    if (!this.validateMemberEmail() || !this.memberEmail.trim()) {
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email: this.memberEmail.trim().toLowerCase(),
      name: this.extractNameFromEmail(this.memberEmail),
      isValid: true
    };

    this.teamForm.members.push(newMember);
    this.memberEmail = '';
    this.memberEmailError = '';
    console.log('Added member:', newMember);
  }

  removeMember(memberId: string) {
    this.teamForm.members = this.teamForm.members.filter(
      member => member.id !== memberId
    );
    console.log('Removed member:', memberId);
  }

  // Event handlers for team member component
  onMemberAdd(member: TeamMember) {
    this.teamForm.members.push(member);
    console.log('Member added via component:', member);
  }

  onMemberRemove(member: TeamMember) {
    this.removeMember(member.id);
  }

  onMembersChange(members: TeamMember[]) {
    this.teamForm.members = members;
    console.log('Members changed:', members);
  }

  private extractNameFromEmail(email: string): string {
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split('.');
    return nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  // Clear messages
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Team creation
  createTeam() {
    this.clearMessages();

    // Validate form
    const isNameValid = this.validateTeamName();
    const isDescriptionValid = this.validateTeamDescription();

    if (!isNameValid || !isDescriptionValid) {
      this.errorMessage = 'Please fix the validation errors before creating the team';
      return;
    }

    if (this.teamForm.members.length === 0) {
      this.errorMessage = 'Please add at least one team member';
      return;
    }

    this.isLoading = true;

    const teamPayload = {
      teamName: this.teamForm.name.trim(),
      teamDescription: this.teamForm.description.trim(),
      teamMembers: this.teamForm.members.map(member => member.email),
      createdBy: this.authService.getLoggedInUserId(),
      createdAt: new Date().toISOString()
    };

    console.log('Creating team with payload:', teamPayload);

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
      this.isLoading = false;
      
      // Mock success response
      this.successMessage = `Team "${this.teamForm.name}" created successfully with ${this.teamForm.members.length} member(s)!`;
      
      // Reset form after successful creation
      setTimeout(() => {
        this.resetForm();
        this.goBack();
      }, 2000);
      
    }, 1500);

    // Uncomment when actual API is available:
    /*
    this.taskService.createTeam(teamPayload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Team "${this.teamForm.name}" created successfully!`;
        console.log('Team created:', response);
        
        setTimeout(() => {
          this.resetForm();
          this.goBack();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create team. Please try again.';
        console.error('Team creation error:', error);
      }
    });
    */
  }

  // Reset form
  resetForm() {
    this.teamForm = {
      name: '',
      description: '',
      members: []
    };
    this.memberEmail = '';
    this.clearMessages();
    this.nameError = '';
    this.descriptionError = '';
    this.memberEmailError = '';
  }

  // Get member count for display
  get memberCount(): number {
    return this.teamForm.members.length;
  }

  // Check if form is valid for submission
  get isFormValid(): boolean {
    return this.teamForm.name.trim().length >= 3 &&
           this.teamForm.description.trim().length >= 10 &&
           this.teamForm.members.length > 0 &&
           !this.nameError &&
           !this.descriptionError &&
           !this.memberEmailError;
  }
}
