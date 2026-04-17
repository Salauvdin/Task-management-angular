import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardAlertDialogComponent, ZardAlertDialogService} from '@/shared/components/alert-dialog';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  tasks: any[] = [
    { name: 'Design UI', status: 'Pending', priority: 'High', date: '2026-03-15' },
    { name: 'Create API', status: 'Completed', priority: 'Medium', date: '2026-03-20' },
    { name: 'Fix Bug', status: 'In Progress', priority: 'Low', date: '2026-03-22' }
  ]

  searchText: string = ''

  filteredTasks: any[] = []

  totalTasks = 0
  completedTasks = 0
  pendingTasks = 0
  completionRate = 0

  ngOnInit() {

    this.filteredTasks = [...this.tasks]

    this.calculateStats()
  }

  calculateStats() {

    this.totalTasks = this.tasks.length

    this.completedTasks = this.tasks.filter(
      t => t.status === "Completed"
    ).length

    this.pendingTasks = this.tasks.filter(
      t => t.status !== "Completed"
    ).length

    this.completionRate = this.totalTasks
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0
  }

  /* SEARCH FILTER */

  filterTasks() {

    const search = this.searchText.toLowerCase()

    this.filteredTasks = this.tasks.filter(task =>
      task.name.toLowerCase().includes(search) ||
      task.status.toLowerCase().includes(search) ||
      task.priority.toLowerCase().includes(search)
    )

  }
  // Add these computed properties
get highPriorityCount(): number {
  return this.tasks.filter(t => t.Priority === 'High').length;
}

get mediumPriorityCount(): number {
  return this.tasks.filter(t => t.Priority === 'Medium').length;
}

get lowPriorityCount(): number {
  return this.tasks.filter(t => t.Priority === 'Low').length;
}

}