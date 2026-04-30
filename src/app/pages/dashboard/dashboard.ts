import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/services/auth';
import { HasPermissionDirective } from '@/directives/has-permission';
import { TaskService } from '@/services/taskServiceapi';
import { TenantService } from '@/services/tenant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermissionDirective],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, AfterViewInit {

  @ViewChild('taskChart', { static: false }) taskChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart', { static: false }) priorityChart!: ElementRef<HTMLCanvasElement>;

  pieChart!: Chart;
  barChart!: Chart;
  canViewDashboard = false;
  loading = false;

  recentTasks: any[] = [];

  stats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public authService: AuthService,
    private taskService: TaskService,
    private tenantService: TenantService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.canViewDashboard = this.authService.hasPermission('View Dashboard', 'read');
    if (this.canViewDashboard) {
      this.tenantService.selectedTenantId$.subscribe(id => {
        this.fetchDashboardData();
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.canViewDashboard) return;
    if (!isPlatformBrowser(this.platformId)) return;
    this.initCharts();
    this.fetchDashboardData(); // ensure data is loaded into charts if they were delayed
  }

  fetchDashboardData() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (response) => {
        const tasks = response.value || response || [];
        this.processTasksData(tasks);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.loading = false;
      }
    });
  }

  processTasksData(tasks: any[]) {
    this.stats.totalTasks = tasks.length;
    this.stats.completedTasks = tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    this.stats.pendingTasks = tasks.filter(t => ['pending', 'todo', 'not started'].includes(t.status?.toLowerCase())).length;
    this.stats.inProgressTasks = tasks.filter(t => ['in progress', 'inprogress', 'doing'].includes(t.status?.toLowerCase())).length;

    // Sort by most recent and take top 5
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdat || b.date).getTime() - new Date(a.createdat || a.date).getTime());
    
    this.recentTasks = sortedTasks.slice(0, 5).map(t => ({
      name: t.title || t.name || t.task_name || 'Unnamed Task',
      assignedTo: t.assignedTo || t.assigned_user || 'Unassigned',
      priority: t.priority || 'Medium',
      status: t.status || 'Pending',
      date: t.dueDate || t.due_date || t.date || t.createdat?.split('T')[0] || 'N/A'
    }));

    this.updateCharts(tasks);
  }

  initCharts(): void {
    if (this.taskChart) {
      const ctxPie = this.taskChart.nativeElement.getContext('2d');
      if (ctxPie && !this.pieChart) {
        this.pieChart = new Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: ['Completed', 'In Progress', 'Pending', 'Other'],
            datasets: [{
              data: [0, 0, 0, 0],
              backgroundColor: ['rgba(74, 222, 128, 0.7)', 'rgba(56, 189, 248, 0.7)', 'rgba(250, 204, 21, 0.7)', 'rgba(156, 163, 175, 0.7)'],
              borderColor: ['rgba(74, 222, 128, 1)', 'rgba(56, 189, 248, 1)', 'rgba(250, 204, 21, 1)', 'rgba(156, 163, 175, 1)'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff' } } }
          }
        });
      }
    }

    if (this.priorityChart) {
      const ctxBar = this.priorityChart.nativeElement.getContext('2d');
      if (ctxBar && !this.barChart) {
        this.barChart = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
              label: 'Tasks by Priority',
              data: [0, 0, 0],
              backgroundColor: ['#4ade80', '#facc15', '#f87171'],
              borderRadius: 8,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { min: 0, ticks: { stepSize: 1, color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
          }
        });
      }
    }
  }

  updateCharts(tasks: any[]) {
    if (this.pieChart) {
      const other = tasks.length - (this.stats.completedTasks + this.stats.inProgressTasks + this.stats.pendingTasks);
      this.pieChart.data.datasets[0].data = [
        this.stats.completedTasks,
        this.stats.inProgressTasks,
        this.stats.pendingTasks,
        other > 0 ? other : 0
      ];
      this.pieChart.update();
    }

    if (this.barChart) {
      const high = tasks.filter(t => t.priority?.toLowerCase() === 'high').length;
      const medium = tasks.filter(t => t.priority?.toLowerCase() === 'medium' || t.priority?.toLowerCase() === 'normal').length;
      const low = tasks.filter(t => t.priority?.toLowerCase() === 'low').length;
      
      this.barChart.data.datasets[0].data = [low, medium, high];
      this.barChart.update();
    }
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in progress':
      case 'inprogress':
      case 'doing': return 'text-blue-400 bg-blue-500/20';
      case 'pending': 
      case 'todo': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  }

  getPriorityClass(priority: string): string {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': 
      case 'normal': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  }

  addTask() {
    console.log('Add task clicked');
  }

  deleteTask(task: any) {
    console.log('Delete task:', task);
  }
}