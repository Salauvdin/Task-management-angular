import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectComponent, ZardSelectItemComponent } from '@/shared/components/select';

import { TaskService } from '@/services/taskServiceapi';

@Component({
  standalone: true,

  imports: [
    FormsModule,
    CommonModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent
  ],

template: `
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-6 flex items-start justify-center pt-4">
  <div class="w-full max-w-2xl">
    <!-- Header -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-semibold text-white tracking-wide">
        <i class="fa-solid fa-clipboard-list text-blue-400 mr-2"></i>
        {{ task?.taskId ? 'Edit Task' : 'Create Task' }}
      </h2>
      <p class="text-gray-400 text-sm mt-1">
        {{ task?.taskId ? 'Update task details below' : 'Fill in the details to create a new task' }}
      </p>
    </div>

  <!-- Form Fields -->
  <div class="space-y-4">
    <!-- Task Name -->
    <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
      <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
        <i class="fa-solid fa-heading text-blue-400"></i>
        Task Name
      </label>
      <input
        z-input
        placeholder="Enter task name..."
        [(ngModel)]="task.taskName"
        class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-200 placeholder-gray-500"
      />
    </div>

    <!-- Status & Priority Row -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Status -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
        <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
          <i class="fa-solid fa-chart-line text-blue-400"></i>
          Status
        </label>
        <z-select [(ngModel)]="task.Statues" class="w-full">
          <z-select-item zValue="Pending">Pending</z-select-item>
          <z-select-item zValue="In Progress">In Progress</z-select-item>
          <z-select-item zValue="Completed">Completed</z-select-item>
        </z-select>
      </div>

      <!-- Priority -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
        <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
          <i class="fa-solid fa-flag text-blue-400"></i>
          Priority
        </label>
        <z-select [(ngModel)]="task.Priorty" class="w-full">
          <z-select-item zValue="Low">Low</z-select-item>
          <z-select-item zValue="Medium">Medium</z-select-item>
          <z-select-item zValue="High">High</z-select-item>
        </z-select>
      </div>
    </div>

    <!-- Assigned To -->
    <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
      <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
        <i class="fa-solid fa-user-group text-blue-400"></i>
        Assigned To
      </label>
      <z-select [(ngModel)]="task.assignedTo" class="w-full">
        <z-select-item zValue="">Select User...</z-select-item>
        <z-select-item *ngFor="let user of users" [zValue]="user.registerId || user.userId">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user text-gray-400"></i>
            {{ user.registerName || user.userName || user.name || user.registerEmail || user.email }}
          </div>
        </z-select-item>
      </z-select>
      <div class="mt-2 text-xs text-gray-500" *ngIf="users.length === 0">
        Loading users...
      </div>
    </div>

    <!-- Date -->
    <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
      <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
        <i class="fa-solid fa-calendar text-blue-400"></i>
        Due Date
      </label>
      <input
        type="date"
        z-input
        [(ngModel)]="task.startDate"
        class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-200"
      />
    </div>
  </div>

  <!-- Footer Info -->
  <div class="mt-6 text-center text-xs text-gray-500 border-t border-white/10 pt-4">
    <div class="flex justify-center gap-4">
      <span class="flex items-center gap-1">
        <i class="fa-solid fa-info-circle"></i>
        {{ task?.taskId ? 'Editing existing task' : 'Creating new task' }}
      </span>
      <span *ngIf="task.assignedTo" class="flex items-center gap-1">
        <i class="fa-solid fa-user-check"></i>
        Assigned to: {{ getAssignedUserName(task.assignedTo) }}
      </span>
    </div>
  </div>
  </div>
</div>
`
})
export class UserTask {

  taskService = inject(TaskService)

  data = inject(Z_MODAL_DATA)

  task:any={
    taskName:'',
    Statues:'',
    Priorty:'',
    startDate:'',
    assignedTo:''
  }
  
  users: any[] = [];
  
  constructor(){
    if(this.data){
      this.task = { ...this.data }
    }
    this.loadUsers();
  }
  
  loadUsers() {
    console.log('Loading users for assignment dropdown...');
    this.taskService.getUserTasks().subscribe({
      next: (res: any) => {
        console.log("Users API RESPONSE in form:", res);
        
        // Handle different response formats
        if (Array.isArray(res)) {
          this.users = res;
        } else if (Array.isArray(res.data)) {
          this.users = res.data;
        } else if (Array.isArray(res.value)) {
          this.users = res.value;
        } else {
          this.users = [];
        }
        
        console.log('Available users in form:', this.users);
        
        // Log user details for debugging
        this.users.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            registerId: user.registerId,
            userId: user.userId,
            registerName: user.registerName,
            userName: user.userName,
            name: user.name,
            email: user.registerEmail || user.email
          });
        });
      },
      error: (err) => {
        console.error('Error loading users in form:', err);
        this.users = [];
      }
    });
  }
  
  getAssignedUserName(assignedToId: any): string {
    if (!assignedToId) return '';
    
    const user = this.users.find(u => 
      (u.registerId && u.registerId === assignedToId) || 
      (u.userId && u.userId === assignedToId)
    );
    
    return user ? (user.registerName || user.userName || user.name || user.registerEmail || user.email) : 'Unknown User';
  }
  saveTask(){

    if(this.task.taskId){

      this.taskService.updateTask(this.task).subscribe(res=>{
        console.log("Task Updated",res)
      })

    }else{

      this.taskService.addTask(this.task).subscribe(res=>{
        console.log("Task Created",res)
      })

    }

  }


}