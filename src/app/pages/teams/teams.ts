import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Angular Forms removed to fix SSR dependency issue
import { TeamService } from '@/services/team.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './teams.html',
  styleUrl: './teams.css'
})
export class TeamsComponent implements OnInit {
  teams: any[] = [];
  loading = false;
  error = '';
  showCreateModal = false;
  newTeamName = '';
  selectedTeam: any = null;
  showTeamDetails = false;

  constructor(
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.error = '';
    
    this.teamService.getAllTeams().subscribe({
      next: (response: any) => {
        // Handle both response formats: { success: boolean, data: Team[] } or { message: string, value: Team[] }
        this.teams = response.data || response.value || [];
        this.loading = false;
        console.log('Teams loaded:', this.teams);
      },
      error: (error) => {
        this.error = 'Failed to load teams';
        this.loading = false;
        console.error('Error loading teams:', error);
      }
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newTeamName = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newTeamName = '';
  }

  createTeamWithName(teamName: string) {
    if (!teamName || teamName.trim().length < 2) {
      this.error = 'Team name must be at least 2 characters';
      return;
    }

    const teamData = { name: teamName.trim() };
    
    this.teamService.createTeam(teamData).subscribe({
      next: (response) => {
        console.log('Team created:', response);
        this.closeCreateModal();
        this.loadTeams(); // Reload teams list
      },
      error: (error) => {
        console.error('Error creating team:', error);
        this.error = 'Failed to create team';
      }
    });
  }

  viewTeamDetails(team: any) {
    this.selectedTeam = team;
    this.showTeamDetails = true;
  }

  closeTeamDetails() {
    this.showTeamDetails = false;
    this.selectedTeam = null;
  }

  deleteTeam(teamId: number) {
    if (confirm('Are you sure you want to delete this team?')) {
      // Note: You'll need to implement deleteTeam method in TaskService
      console.log('Delete team:', teamId);
      // this.taskService.deleteTeam(teamId).subscribe(...)
    }
  }

  getTeamStats(team: any) {
    return {
      taskCount: team.taskCount || (team.tasks?.length || 0),
      createdAt: new Date(team.created_at || team.createdAt).toLocaleDateString()
    };
  }
}
