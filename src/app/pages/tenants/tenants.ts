import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService, Tenant } from '@/services/tenant.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css'
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = false;
  error = '';
  showModal = false;
  isEditing = false;
  selectedTenantId: number = 0;

  currentTenant: Tenant = {
    name: '',
    logo: ''
  };

  constructor(
    private tenantService: TenantService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.tenantService.selectedTenantId$.subscribe(id => {
      this.selectedTenantId = id;
      this.cd.detectChanges();
    });
  }

  loadTenants() {
    this.loading = true;
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tenants:', err);
        this.error = 'Failed to load tenants';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentTenant = { name: '', logo: '' };
    this.showModal = true;
  }

  openEditModal(tenant: Tenant) {
    this.isEditing = true;
    this.currentTenant = { ...tenant };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveTenant() {
    if (!this.currentTenant.name) return;

    this.loading = true;
    if (this.isEditing && this.currentTenant.id) {
      this.tenantService.updateTenant(this.currentTenant.id, this.currentTenant).subscribe({
        next: () => {
          this.loadTenants();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating tenant:', err);
          this.error = 'Failed to update tenant';
          this.loading = false;
        }
      });
    } else {
      this.tenantService.createTenant(this.currentTenant).subscribe({
        next: () => {
          this.loadTenants();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating tenant:', err);
          this.error = 'Failed to create tenant';
          this.loading = false;
        }
      });
    }
  }

  deleteTenant(id: number) {
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.tenantService.deleteTenant(id).subscribe({
        next: () => {
          this.loadTenants();
        },
        error: (err) => {
          console.error('Error deleting tenant:', err);
          this.error = 'Failed to delete tenant';
        }
      });
    }
  }

  selectTenant(tenant: Tenant) {
    if (tenant.id) {
      this.tenantService.setTenantId(tenant.id);
    }
  }

  get selectedTenantName(): string {
    const tenant = this.tenants.find(t => t.id === this.selectedTenantId);
    return tenant ? tenant.name : '';
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'T';
  }
}
