import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Team {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  team_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  team_name?: string;
  created_by_name?: string;
  assignedUsers?: AssignedUser[];
  comments?: Comment[];
}

export interface AssignedUser {
  id: number;
  name: string;
  email: string;
  assigned_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/v1';
  
  // Signals for state management
  teams = signal<Team[]>([]);
  tasks = signal<Task[]>([]);
  selectedTeam = signal<Team | null>(null);
  selectedTask = signal<Task | null>(null);
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signals
  groupedTeams = computed(() => {
    const teamsList = this.teams();
    const tasksList = this.tasks();
    
    return teamsList.map(team => ({
      ...team,
      tasks: tasksList.filter(task => task.team_id === team.id)
    }));
  });

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    console.log('Authorization header:', token ? `Bearer ${token}` : 'No token found');
    
    const headerObj: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headerObj['Authorization'] = `Bearer ${token}`;
    }
    
    const headers = new HttpHeaders(headerObj);
    console.log('Final headers:', headers);
    return headers;
  }

  // Team CRUD operations
  getAllTeams(): Observable<{ success: boolean; data: Team[] }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: Team[] }>(
      `${this.apiUrl}/teams`,
      { headers: this.getAuthHeaders() }
    );
  }

  getTeamById(id: number): Observable<{ success: boolean; data: Team }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: Team }>(
      `${this.apiUrl}/teams/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createTeam(teamData: Partial<Team>): Observable<{ success: boolean; data: Team }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.post<{ success: boolean; data: Team }>(
      `${this.apiUrl}/teams`,
      teamData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateTeam(id: number, teamData: Partial<Team>): Observable<{ success: boolean; data: Team }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.put<{ success: boolean; data: Team }>(
      `${this.apiUrl}/teams/${id}`,
      teamData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTeam(id: number): Observable<{ success: boolean; message: string }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/teams/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Task CRUD operations
  getAllTasks(teamId?: number): Observable<{ success: boolean; data: Task[] }> {
    this.loading.set(true);
    this.error.set(null);
    
    const url = teamId ? `${this.apiUrl}/tasks?teamId=${teamId}` : `${this.apiUrl}/tasks`;
    
    return this.http.get<{ success: boolean; data: Task[] }>(
      url,
      { headers: this.getAuthHeaders() }
    );
  }

  getTaskById(id: number): Observable<{ success: boolean; data: Task }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: Task }>(
      `${this.apiUrl}/tasks/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createTask(taskData: Partial<Task>): Observable<{ success: boolean; data: Task }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.post<{ success: boolean; data: Task }>(
      `${this.apiUrl}/tasks`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateTask(id: number, taskData: Partial<Task>): Observable<{ success: boolean; data: Task }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.put<{ success: boolean; data: Task }>(
      `${this.apiUrl}/tasks/${id}`,
      taskData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTask(id: number): Observable<{ success: boolean; message: string }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/tasks/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Task assignment operations
  assignUsersToTask(taskId: number, userIds: number[], assignedBy: number): Observable<{ success: boolean; message: string }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/tasks/${taskId}/assign-users`,
      { userIds, assigned_by: assignedBy },
      { headers: this.getAuthHeaders() }
    );
  }

  getAssignedUsers(taskId: number): Observable<{ success: boolean; data: AssignedUser[] }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: AssignedUser[] }>(
      `${this.apiUrl}/tasks/${taskId}/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // User operations
  getAllUsers(): Observable<{ success: boolean; data: User[] }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: User[] }>(
      `${this.apiUrl}/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Comment operations
  getTaskComments(taskId: number): Observable<{ success: boolean; data: Comment[] }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<{ success: boolean; data: Comment[] }>(
      `${this.apiUrl}/comments/tasks/${taskId}/comments`,
      { headers: this.getAuthHeaders() }
    );
  }

  addComment(taskId: number, message: string, userId: number): Observable<{ success: boolean; data: Comment }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.post<{ success: boolean; data: Comment }>(
      `${this.apiUrl}/comments/tasks/${taskId}/comments`,
      { message, user_id: userId },
      { headers: this.getAuthHeaders() }
    );
  }

  updateComment(commentId: number, message: string): Observable<{ success: boolean; data: Comment }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.put<{ success: boolean; data: Comment }>(
      `${this.apiUrl}/comments/comments/${commentId}`,
      { message },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteComment(commentId: number): Observable<{ success: boolean; message: string }> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/comments/comments/${commentId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // State management methods
  loadTeams() {
    this.getAllTeams().subscribe({
      next: (response) => {
        this.teams.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load teams');
        this.loading.set(false);
        console.error('Error loading teams:', error);
      }
    });
  }

  loadTasks(teamId?: number) {
    this.getAllTasks(teamId).subscribe({
      next: (response) => {
        this.tasks.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load tasks');
        this.loading.set(false);
        console.error('Error loading tasks:', error);
      }
    });
  }

  loadUsers() {
    this.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load users');
        this.loading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

  selectTeam(team: Team) {
    this.selectedTeam.set(team);
  }

  selectTask(task: Task) {
    this.selectedTask.set(task);
  }

  clearError() {
    this.error.set(null);
  }
}
