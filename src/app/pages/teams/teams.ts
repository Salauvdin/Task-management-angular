import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@/services/taskServiceapi';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
  teams: any[] = [];
  loading = false;
  error = '';
  showCreateModal = false;
  showEditModal = false;
  showTeamDetails = false;
  
  selectedTeam: any = null;
  availableUsers: any[] = [];
  availableTasks: any[] = [];
  selectedUserIds: number[] = [];
  selectedTaskNames: string[] = [];
  selectedTaskIds: number[] = [];
  initialComment = '';
  showTaskDropdown = false;
  showUserDropdown = false;
  
  // Form fields
  newTeamName = '';
  editTeamName = '';
  editingTeam: any = null;
  
  private loadingTimeout: any;

  constructor(
    private taskService: TaskService,
    private cd: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadTeams();
    this.loadAvailableUsers();
    this.loadAvailableTasks();
  }

  loadAvailableTasks() {
    this.taskService.getTasks().subscribe({
      next: (response: any) => {
        let tasks = Array.isArray(response) ? response : (response.data || response.value || []);
        // Filter out completed tasks
        this.availableTasks = tasks.filter((task: any) => 
          (task.status || task.taskStatus) !== 'Completed'
        );
      },
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  loadAvailableUsers() {
    this.taskService.getUserTasks().subscribe({
      next: (response: any) => {
        this.availableUsers = Array.isArray(response) ? response : (response.data || response.value || []);
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadTeams() {
    this.error = '';
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    
    this.loadingTimeout = setTimeout(() => this.loading = true, 300);
    
    this.taskService.getTeams().subscribe({
      next: (response: any) => {
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
        
        let teamsData = [];
        if (response && response.data) teamsData = response.data;
        else if (response && response.value) teamsData = response.value;
        else if (Array.isArray(response)) teamsData = response;
        
        this.teams = teamsData;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
        console.error('Error loading teams:', error);
        this.teams = [];
        this.loading = false;
        this.error = 'Failed to load teams from API';
      }
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newTeamName = '';
    this.selectedUserIds = [];
    this.selectedTaskNames = [];
    this.selectedTaskIds = [];
    this.initialComment = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createTeam() {
    if (!this.newTeamName || this.newTeamName.trim().length < 2) {
      this.error = 'Team name must be at least 2 characters';
      return;
    }

    const selectedUsers = this.availableUsers.filter(u => 
      this.selectedUserIds.includes(u.registerId || u.userId)
    ).map(u => ({
      userId: u.registerId || u.userId,
      name: u.registerName || u.userName || u.name,
      email: u.registerEmail || u.email,
      role: u.registerRole || u.role
    }));

    const comments = this.initialComment.trim() ? [{
      userId: 1, // Default to admin for now
      userName: 'Admin',
      message: this.initialComment.trim(),
      createdAt: new Date().toISOString()
    }] : [];

    const teamData = { 
      name: this.newTeamName.trim(),
      taskNames: this.selectedTaskNames,
      assignedUsers: selectedUsers,
      comments: comments
    };
    
    this.loading = true;
    this.taskService.createTeam(teamData).subscribe({
      next: () => {
        this.loading = false;
        this.closeCreateModal();
        this.loadTeams();
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error creating team:', error);
        this.error = 'Failed to create team';
        this.cd.detectChanges();
      }
    });
  }

  openEditModal(team: any) {
    this.editingTeam = team;
    this.editTeamName = team.name || '';
    this.selectedUserIds = (team.assignedUsers || []).map((u: any) => u.userId || u.registerId || u.id);
    this.selectedTaskNames = team.taskNames || [];
    this.selectedTaskIds = this.availableTasks
      .filter(task => this.selectedTaskNames.includes(task.taskName || task.title))
      .map(task => task.id || task.taskId);
    this.initialComment = ''; // Don't preload previous comments for edit
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTeam = null;
  }

  updateTeam() {
    if (!this.editingTeam || !this.editTeamName || this.editTeamName.trim().length < 2) {
      this.error = 'Team name must be at least 2 characters';
      return;
    }

    const selectedUsers = this.availableUsers.filter(u => 
      this.selectedUserIds.includes(u.registerId || u.userId)
    ).map(u => ({
      userId: u.registerId || u.userId,
      name: u.registerName || u.userName || u.name,
      email: u.registerEmail || u.email,
      role: u.registerRole || u.role
    }));

    const teamData = {
      name: this.editTeamName.trim(),
      taskNames: this.selectedTaskNames,
      assignedUsers: selectedUsers,
      comments: this.editingTeam.comments || []
    };

    this.loading = true;
    console.log('Updating team with ID:', this.editingTeam.id || this.editingTeam.teamId);
    this.taskService.updateTeam(this.editingTeam.id || this.editingTeam.teamId, teamData).subscribe({
      next: (res) => {
        console.log('Update success:', res);
        this.loading = false;
        this.closeEditModal();
        this.loadTeams();
        this.cd.detectChanges();
      },
      error: (error: any) => {
        console.error('Update failed:', error);
        this.error = 'Failed to update team';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  deleteTeam(teamId: number) {
    if (confirm('Are you sure you want to delete this team?')) {
      this.taskService.deleteTeam(teamId).subscribe({
        next: () => this.loadTeams(),
        error: (error: any) => {
          console.error('Error deleting team:', error);
          this.error = 'Failed to delete team';
        }
      });
    }
  }

  viewTeamDetails(team: any) {
    this.selectedTeam = team;
    this.showTeamDetails = true;
  }

  closeTeamDetails() {
    this.showTeamDetails = false;
    this.selectedTeam = null;
  }

  getTeamStats(team: any) {
    return {
      taskCount: team.taskNames?.length || 0,
      userCount: team.assignedUsers?.length || 0,
      createdAt: new Date(team.createdAt || team.created_at).toLocaleDateString()
    };
  }

  // Toggle user selection
  toggleUserSelection(userId: number) {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  getSelectedUsers() {
    return this.availableUsers.filter(u => 
      this.selectedUserIds.includes(u.registerId || u.userId)
    );
  }

  getSelectedTasks() {
    return this.availableTasks.filter(t => 
      this.selectedTaskIds.includes(t.id || t.taskId)
    );
  }

  toggleTaskDropdown() {
    this.showTaskDropdown = !this.showTaskDropdown;
    this.showUserDropdown = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    this.showTaskDropdown = false;
  }

  // Toggle task selection (Multiple select mode with unique IDs)
  toggleTaskSelection(task: any) {
    const taskId = task.id || task.taskId;
    const taskName = task.taskName || task.title;
    
    const index = this.selectedTaskIds.indexOf(taskId);
    if (index > -1) {
      // Remove task
      this.selectedTaskIds.splice(index, 1);
      const nameIndex = this.selectedTaskNames.indexOf(taskName);
      if (nameIndex > -1) this.selectedTaskNames.splice(nameIndex, 1);
    } else {
      // Add task
      this.selectedTaskIds.push(taskId);
      this.selectedTaskNames.push(taskName);
    }
  }

  isTaskSelected(task: any): boolean {
    const taskId = task.id || task.taskId;
    return this.selectedTaskIds.includes(taskId);
  }
}
