import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/services/auth';
import { HasPermissionDirective } from '@/directives/has-permission';

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

  recentTasks = [
    { name: 'Design Landing Page', assignedTo: 'Alice', priority: 'High', status: 'In Progress', date: '2026-03-16' },
    { name: 'Setup API', assignedTo: 'Bob', priority: 'Medium', status: 'Pending', date: '2026-03-18' },
    { name: 'Fix Bug #234', assignedTo: 'Charlie', priority: 'High', status: 'Completed', date: '2026-03-14' },
    { name: 'Write Documentation', assignedTo: 'Diana', priority: 'Low', status: 'Pending', date: '2026-03-20' }
  ];

  stats = {
    totalTasks: 43,
    completedTasks: 28,
    pendingTasks: 15,
    inProgressTasks: 12
  };

  // Make authService public by removing 'private' keyword
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public authService: AuthService  // Changed from private to public
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.canViewDashboard = this.authService.hasPermission('View Dashboard', 'read');
  }

  ngAfterViewInit(): void {
    if (!this.canViewDashboard) return;
    if (!isPlatformBrowser(this.platformId)) return;
    this.initCharts();
  }

  initCharts(): void {
    // Pie Chart
    if (this.taskChart) {
      const ctxPie = this.taskChart.nativeElement.getContext('2d');
      if (ctxPie) {
        this.pieChart = new Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: ['Design', 'Development', 'Testing', 'Deployment'],
            datasets: [{
              data: [12, 19, 7, 5],
              backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
              borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
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

    // Bar Chart
    if (this.priorityChart) {
      const ctxBar = this.priorityChart.nativeElement.getContext('2d');
      if (ctxBar) {
        this.barChart = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
              label: 'Tasks by Priority',
              data: [5, 7, 12],
              backgroundColor: ['#34D399', '#FACC15', '#F87171'],
              borderRadius: 8,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { min: 0, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
          }
        });
      }
    }
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in progress': return 'text-blue-400 bg-blue-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  }

  getPriorityClass(priority: string): string {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
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