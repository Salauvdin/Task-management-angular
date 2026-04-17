import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  apiUrl = "http://localhost:3000/v1";

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────────────────
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // ── Register Users (admin read/update/delete) ─────────────
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getRegisterUsers`);
  }

  updateUser(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateRegisterUser/${data.registerId}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deleteRegisterUser/${id}`, {});
  }

  // ── User Management (admin panel) ─────────────────────────
  getUserTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUser`);
  }

  addUserTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, data);
  }

  updateUserTask(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateUser`, data);
  }

  deleteUserTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteUser/${id}`);
  }

  // ── Task APIs ─────────────────────────────────────────────
  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getTask`);
  }

  addTask(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addTask`, data);
  }

  updateTask(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateTask/${data.taskId}`, data);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deleteTask/${id}`, {});
  }
}