  import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { RouterModule } from '@angular/router';

  import { ZardCardComponent } from '@/shared/components/card';
  import { ZardButtonComponent } from '@/shared/components/button';
  import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
  import { ZardDialogService } from '@/shared/components/dialog';
  import { HasPermissionDirective } from '@/directives/has-permission';

  import { UserTask } from '@/user-task/user-task';
  import { TaskService } from '@/services/task';
  import { AuthService } from '@/services/auth';

  @Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      RouterModule,
      HasPermissionDirective  
    ],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
  })
  export class Tasks implements OnInit {
    tasks: any[] = [];
    filteredTasks: any[] = [];
    searchText: string = "";
    viewMode: 'card' | 'table' = 'card'; // Default view

    // Permission flags
    canWrite = false;
    canDelete = false;
    canRead = false;

    private cd = inject(ChangeDetectorRef);
    private alertDialogService = inject(ZardAlertDialogService);
    private dialog = inject(ZardDialogService);

    constructor(
      private taskService: TaskService,
      private authService: AuthService
    ) {}

    ngOnInit() {
      this.checkPermissions();
      if (this.canRead) {
        this.getAllTasks();
      }
    }

    // Check user permissions
    checkPermissions() {
      this.canRead = this.authService.hasPermission('Tasks', 'read');
      this.canWrite = this.authService.hasPermission('Tasks', 'write');
      this.canDelete = this.authService.hasPermission('Tasks', 'delete');
      
      console.log('Task Permissions:', { 
        canRead: this.canRead, 
        canWrite: this.canWrite, 
        canDelete: this.canDelete 
      });

      // If no read permission, show message
      if (!this.canRead) {
        console.log('User does not have permission to view tasks');
      }
    }

    // GET TASKS
    getAllTasks() {
      if (!this.canRead) return;

      this.taskService.getTasks().subscribe({
        next: (res: any) => {
          console.log("API RESPONSE:", res);
          
          // Handle different response formats
          if (Array.isArray(res)) {
            this.tasks = res;
          } else if (Array.isArray(res.data)) {
            this.tasks = res.data;
          } else if (Array.isArray(res.value)) {
            this.tasks = res.value;
          } else {
            this.tasks = [];
          }

          this.filteredTasks = [...this.tasks];
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
        }
      });
    }

    // OPEN CREATE / EDIT FORM
    openTaskForm(task?: any) {
      // Check write permission for create/edit
      if (!this.canWrite) {
        alert('You don\'t have permission to create or edit tasks');
        return;
      }

      this.dialog.create({
        zTitle: task ? 'Edit Task' : 'Create Task',
        zContent: UserTask,
        zData: task,
        zOkText: 'Save',
        zCancelText: 'Cancel',
        zCustomClasses: 'delete-dialog',
        zOnOk: (instance: any) => {
          setTimeout(() => {
            const formUser = instance.task;

            if (!formUser.taskName) {
              alert('Task name is required');
              return;
            }

            if (formUser.startDate) {
              formUser.startDate = formUser.startDate.split('T')[0];
            }

            // UPDATE
            if (task) {
              this.taskService.updateTask(formUser).subscribe({
                next: (res: any) => {
                  console.log("Updated", res);
                  this.getAllTasks();
                  this.cd.detectChanges();
                },
                error: (err) => {
                  console.log("Update Error", err);
                  alert('Failed to update task');
                }
              });
            }
            // CREATE
            else {
              this.taskService.addTask(formUser).subscribe({
                next: (res: any) => {
                  console.log("Created", res);
                  this.getAllTasks();
                  this.cd.detectChanges();
                },
                error: (err) => {
                  console.log("Create Error", err);
                  alert('Failed to create task');
                }
              });
            }
          }, 0);
        }
      });
    }

    // DELETE TASK
    deleteTask(task: any) {
      if (!this.canDelete) {
        alert('You don\'t have permission to delete tasks');
        return;
      }

      console.log("Deleting ID:", task.taskId);

      this.taskService.deleteTask(task.taskId).subscribe({
        next: (res: any) => {
          console.log("Delete Response:", res);
          this.getAllTasks();
        },
        error: (err) => {
          console.log("Delete Error:", err);
          alert('Failed to delete task');
        }
      });
    }

    // DELETE CONFIRM DIALOG
    showDialog(task: any) {
      if (!this.canDelete) {
        alert('You don\'t have permission to delete tasks');
        return;
      }

      this.alertDialogService.confirm({
        zTitle: 'Delete Task',
        zDescription: `Are you sure you want to delete "${task.taskName}"?`,
        zCancelText: 'Cancel',
        zOkText: 'Delete',
        zCustomClasses: 'delete-dialog',
        zOnOk: () => {
          this.deleteTask(task);
        }
      });
    }

    // SEARCH
    filterTasks() {
      const search = this.searchText.toLowerCase();
      this.filteredTasks = this.tasks.filter(task =>
        task.taskName?.toLowerCase().includes(search) ||
        task.Statues?.toLowerCase().includes(search) ||
        task.Priorty?.toLowerCase().includes(search) ||
        task.status?.toLowerCase().includes(search) ||
        task.priority?.toLowerCase().includes(search)
      );
    }

    // Change view mode
    setViewMode(mode: 'card' | 'table') {
      this.viewMode = mode;
    }
  }