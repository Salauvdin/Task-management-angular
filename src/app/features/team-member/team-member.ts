import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isValid: boolean;
  addedAt?: Date;
}

@Component({
  selector: 'app-team-member',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './team-member.html',
  styleUrl: './team-member.css'
})
export class TeamMemberComponent implements OnInit {
  @Input() members: TeamMember[] = [];
  @Input() readonly: boolean = false;
  @Input() showRoles: boolean = false;
  
  @Output() membersChange = new EventEmitter<TeamMember[]>();
  @Output() memberRemove = new EventEmitter<TeamMember>();
  @Output() memberAdd = new EventEmitter<TeamMember>();

  newMemberEmail: string = '';
  newMemberRole: string = 'Member';
  emailError: string = '';

  availableRoles = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Member', label: 'Team Member' },
    { value: 'Viewer', label: 'Viewer' }
  ];

  ngOnInit() {
    console.log('Team Member Component initialized with members:', this.members);
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.newMemberEmail.trim()) {
      this.emailError = '';
      return true; // Empty email is ok for validation
    }
    
    if (!emailRegex.test(this.newMemberEmail)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    }
    
    // Check for duplicate emails
    const isDuplicate = this.members.some(
      member => member.email.toLowerCase() === this.newMemberEmail.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      this.emailError = 'This email is already added to the team';
      return false;
    }
    
    this.emailError = '';
    return true;
  }

  addMember() {
    if (this.readonly) {
      return;
    }

    if (!this.validateEmail() || !this.newMemberEmail.trim()) {
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email: this.newMemberEmail.trim().toLowerCase(),
      role: this.showRoles ? this.newMemberRole : 'Member',
      name: this.extractNameFromEmail(this.newMemberEmail),
      isValid: true,
      addedAt: new Date()
    };

    this.memberAdd.emit(newMember);
    this.newMemberEmail = '';
    this.emailError = '';
    this.newMemberRole = 'Member';
    
    console.log('Added new team member:', newMember);
  }

  removeMember(member: TeamMember, event?: Event) {
    if (this.readonly) {
      return;
    }

    if (event) {
      event.stopPropagation();
    }

    this.memberRemove.emit(member);
    console.log('Removed team member:', member);
  }

  onEmailChange() {
    this.validateEmail();
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addMember();
    }
  }

  private extractNameFromEmail(email: string): string {
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split('.');
    return nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getMemberCount(): number {
    return this.members.length;
  }

  getValidMemberCount(): number {
    return this.members.filter(member => member.isValid).length;
  }

  getRoleDisplay(role?: string): string {
    if (!role) return 'Member';
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getMemberInitials(name?: string, email?: string): string {
    if (name) {
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    }
    
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }

  isLastMember(member: TeamMember): boolean {
    return this.members[this.members.length - 1]?.id === member.id;
  }

  trackByMemberId(index: number, member: TeamMember): string {
    return member.id;
  }
}
