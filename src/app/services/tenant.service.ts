import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Tenant {
  id?: number;
  name: string;
  logo?: string | null;
  createdby?: number;
  updatedby?: number;
  createdat?: string;
  updatedat?: string;
  isdeleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = 'http://localhost:3000/v1/tenants';
  private selectedTenantIdSubject = new BehaviorSubject<number>(0);
  private selectedTenantSubject = new BehaviorSubject<Tenant | null>(null);

  selectedTenantId$ = this.selectedTenantIdSubject.asObservable();
  selectedTenant$ = this.selectedTenantSubject.asObservable();

  constructor(private http: HttpClient) {
    // We do NOT initialize from storage in the constructor anymore.
    // Instead, we wait for the app to explicitly call it or for a login to happen.
    // This prevents the "pre-login" API calls on app boot.
  }

  // New method to be called after login or when app is ready
  initializeFromStorage() {
    if (typeof window !== 'undefined') {
      const savedTenantId = localStorage.getItem('selectedTenantId');
      const token = localStorage.getItem('token');
      const login = localStorage.getItem('login');
      
      if (savedTenantId && token && login === 'true') {
        const id = Number(savedTenantId);
        this.selectedTenantIdSubject.next(id);
        
        if (id > 0) {
          this.fetchTenantDetails(id);
        }
      }
    }
  }

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

  setTenantId(id: number) {
    this.selectedTenantIdSubject.next(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTenantId', id.toString());
    }
    
    // Only fetch details if we have a token
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const login = typeof localStorage !== 'undefined' ? localStorage.getItem('login') : null;

    if (id > 0 && token && login === 'true') {
      this.fetchTenantDetails(id);
    } else {
      this.selectedTenantSubject.next(null);
    }
  }

  private fetchTenantDetails(id: number) {
    this.getTenantById(id).subscribe({
      next: (tenant) => this.selectedTenantSubject.next(tenant),
      error: (err) => {
        console.error('Error fetching tenant details:', err);
        if (err.status === 401 || err.status === 403) {
          this.selectedTenantSubject.next(null);
        }
      }
    });
  }

  getSelectedTenantId(): number {
    return this.selectedTenantIdSubject.value;
  }

  getTenants(): Observable<Tenant[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const login = typeof localStorage !== 'undefined' ? localStorage.getItem('login') : null;
    
    if (!token || login !== 'true') return of([]);
    
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(response => response.value || response || []),
      catchError(() => of([]))
    );
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(response => response.value || response)
    );
  }

  createTenant(tenant: Tenant): Observable<Tenant> {
    return this.http.post<any>(this.apiUrl, tenant, { headers: this.getAuthHeaders() });
  }

  updateTenant(id: number, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, tenant, { headers: this.getAuthHeaders() });
  }

  deleteTenant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
