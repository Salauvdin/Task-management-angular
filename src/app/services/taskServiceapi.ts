import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  apiUrl = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    let token = null;
    let selectedTenantId = null;

    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
      selectedTenantId = localStorage.getItem('selectedTenantId');
    }
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (selectedTenantId && Number(selectedTenantId) > 0) {
      headers = headers.set('x-tenant-id', selectedTenantId);
    }

    return headers;
  }

  // ── Auth ──────────────────────────────────────────────────
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/signup`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/login`, data);
  }

  // ── Register Users (admin read/update/delete) ─────────────
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/getRegisterUsers`, { headers: this.getAuthHeaders() });
  }

  updateUser(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/updateRegisterUser/${data.registerId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/deleteRegisterUser/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // ── User Management (admin panel) ─────────────────────────
  getUserTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/gettaskUser`, { headers: this.getAuthHeaders() });
  }

  addUserTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/addTaskUser`, data, { headers: this.getAuthHeaders() });
  }

  updateUserTask(data: any): Observable<any> {
    const userId = data.userId || data.registerId;

    if (!userId) {
      throw new Error('User ID is required for update');
    }

    return this.http.patch(`${this.apiUrl}/v1/updatetaskUser/${userId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteUserTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/deletetaskUser/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // ── Task APIs ─────────────────────────────────────────────
  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/getTask`, { headers: this.getAuthHeaders() });
  }

  getTaskById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/getTask/${id}`, { headers: this.getAuthHeaders() });
  }

  addTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/addTask`, data, { headers: this.getAuthHeaders() });
  }

  updateTask(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/updateTask/${data.taskId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/deleteTask/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  getAssignedUsers(taskId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/users`, { headers: this.getAuthHeaders() });
  }

  getComments(taskId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/comments`, { headers: this.getAuthHeaders() });
  }

  // // Notification APIs ////
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/notifications`, { headers: this.getAuthHeaders() });
  }

  getNotificationsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/notifications/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/notifications/read/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // Role Management APIs
  deleteRole(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/v1/deleteRole/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // ── Teams APIs ─────────────────────────────────────────────
  getTeams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/teams`, { headers: this.getAuthHeaders() });
  }

  getTeamById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teams/${id}`, { headers: this.getAuthHeaders() });
  }

  createTeam(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams`, data, { headers: this.getAuthHeaders() });
  }

  updateTeam(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/teams/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${id}`, { headers: this.getAuthHeaders() });
  }

  assignUsersToTask(taskId: number, userIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/assign-users`, { userIds }, { headers: this.getAuthHeaders() });
  }

  addCommentToTask(taskId: number, comment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/comments`, comment, { headers: this.getAuthHeaders() });
  }
}
