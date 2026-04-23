import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  apiUrl = "http://localhost:3000/v1";

  constructor(private http: HttpClient) {}

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ── Auth ──────────────────────────────────────────────────
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // ── Register Users (admin read/update/delete) ─────────────
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getRegisterUsers`, { headers: this.getAuthHeaders() });
  }

  updateUser(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateRegisterUser/${data.registerId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deleteRegisterUser/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // ── User Management (admin panel) ─────────────────────────
  getUserTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gettaskUser`, { headers: this.getAuthHeaders() });
  }

  addUserTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addTaskUser`, data, { headers: this.getAuthHeaders() });
  }

  updateUserTask(data: any): Observable<any> {
    const userId = data.userId || data.registerId;
    return this.http.patch(`${this.apiUrl}/updatetaskUser/${userId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteUserTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deletetaskUser/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // ── Task APIs ─────────────────────────────────────────────
  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getTask`, { headers: this.getAuthHeaders() });
  }

  addTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addTask`, data, { headers: this.getAuthHeaders() });
  }

  updateTask(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateTask/${data.taskId}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deleteTask/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // // Notification APIs ////
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getAuthHeaders() });
  }

  getNotificationsByUser(userId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/api/notifications/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // Role Management APIs
  deleteRole(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deleteRole/${id}`, {}, { headers: this.getAuthHeaders() });
  }
}
