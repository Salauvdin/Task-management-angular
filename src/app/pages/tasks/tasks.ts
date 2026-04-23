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
  import { TaskService } from '@/services/taskServiceapi';
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
    users: any[] = [];
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
        this.getAllUsers();
      }
      
      // Check if new user was created and refresh users
      if (localStorage.getItem('userCreated') === 'true') {
        localStorage.removeItem('userCreated');
        this.getAllUsers();
      }
    }

    private normalizeTask(task: any): any {
      const status = task?.status ?? task?.Statues ?? 'Pending';
      const priority = task?.priority ?? task?.Priorty ?? 'Medium';
      const startDate = task?.startDate ?? task?.dueDate ?? '';

      return {
        ...task,
        status,
        priority,
        startDate,
        // Keep legacy keys for existing template bindings
        Statues: task?.Statues ?? status,
        Priorty: task?.Priorty ?? priority,
        dueDate: task?.dueDate ?? startDate
      };
    }

    private buildTaskPayload(rawTask: any): any {
      const normalizedTask = this.normalizeTask(rawTask);
      return {
        taskId: normalizedTask.taskId,
        taskName: normalizedTask.taskName?.trim(),
        status: normalizedTask.status,
        priority: normalizedTask.priority,
        startDate: normalizedTask.startDate,
        assignedTo: normalizedTask.assignedTo
      };
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
      const loggedInUserId = this.authService.getLoggedInUserId();

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

          this.tasks = this.tasks.map((task) => this.normalizeTask(task));

          // Show only tasks created by currently logged-in user.
          if (loggedInUserId) {
            this.tasks = this.tasks.filter((task: any) =>
              Number(task.createdBy) === Number(loggedInUserId)
            );
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

      // Create modal dialog at top of website with Zard-like size
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42));
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        animation: fadeIn 0.3s ease-out;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      `;

      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `;
      document.head.appendChild(style);

      modal.innerHTML = `
        <div class="max-w-2xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-white tracking-wide">
              <i class="fa-solid fa-clipboard-list text-blue-400 mr-2"></i>
              ${task ? 'Edit Task' : 'Create Task'}
            </h2>
            <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-400 hover:text-white text-2xl">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div class="text-xs text-gray-500 mb-4">
            <strong>DEBUG:</strong> Task ID: ${task?.taskId || 'New'} | 
            Start Date: ${task?.startDate || 'Not set'} | 
            Due Date: ${task?.dueDate || 'Not set'}
          </div>
          
          <div class="space-y-4">
            <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
                <i class="fa-solid fa-heading text-blue-400"></i>
                Task Name
              </label>
              <input type="text" id="taskName" placeholder="Enter task name..." 
                value="${task?.taskName || ''}"
                class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-200 placeholder-gray-500" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-chart-line text-blue-400"></i>
                  Status
                </label>
                <select id="status" class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none">
                  <option value="Pending" ${task?.Statues === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="In Progress" ${task?.Statues === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Completed" ${task?.Statues === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
              </div>

              <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-flag text-blue-400"></i>
                  Priority
                </label>
                <select id="priority" class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none">
                  <option value="Low" ${task?.Priorty === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Medium" ${task?.Priorty === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="High" ${task?.Priorty === 'High' ? 'selected' : ''}>High</option>
                </select>
              </div>
            </div>

            <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
                <i class="fa-solid fa-user-group text-blue-400"></i>
                Assigned To
              </label>
              <select id="assignedTo" class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none">
                <option value="">Select User...</option>
              </select>
            </div>

            <div class="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <label class="text-sm text-blue-300 font-medium flex items-center gap-2 mb-2">
                <i class="fa-solid fa-calendar-check text-blue-400"></i>
                Due Date
              </label>
              <input type="date" id="dueDate" 
                value="${task?.dueDate || ''}"
                class="w-full bg-slate-800/50 border border-blue-500/20 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-200" />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button onclick="this.closest('.modal-overlay').remove()" 
              class="px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-600/30 rounded-xl transition-all duration-200">
              Cancel
            </button>
            <button onclick="saveTask(this)" 
              class="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl transition-all duration-200">
              <i class="fa-solid fa-save mr-2"></i>
              ${task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </div>
      `;

      // Add overlay class for easy removal
      modal.classList.add('modal-overlay');
      document.body.appendChild(modal);

      // Load users for dropdown
      console.log('Fetching users for assigned to dropdown...');
      this.taskService.getUserTasks().subscribe({
        next: (res: any) => {
          console.log('Raw API Response:', res);
          
          const users = Array.isArray(res) ? res : (res.data || res.value || []);
          console.log('Processed users array:', users);
          
          const select = modal.querySelector('#assignedTo') as HTMLSelectElement;
          
          if (users.length === 0) {
            console.warn('No users found in API response');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No users available';
            select.appendChild(option);
          } else {
            users.forEach((user: any, index: number) => {
              console.log(`Processing user ${index + 1}:`, {
                registerId: user.registerId,
                userId: user.userId,
                registerName: user.registerName,
                userName: user.userName,
                name: user.name,
                email: user.registerEmail || user.email
              });
              
              const option = document.createElement('option');
              option.value = user.registerId || user.userId || '';
              const displayName = user.registerName || user.userName || user.name || user.registerEmail || user.email || 'Unknown User';
              option.textContent = displayName;
              
              // Fix user selection for editing - ensure proper string comparison
              const taskAssignedId = String(task?.assignedTo || '');
              const optionValue = String(option.value);
              option.selected = optionValue === taskAssignedId;
              
              console.log(`Created option: value="${option.value}", text="${displayName}", selected=${option.selected}`);
              console.log(`Task assignedTo: ${taskAssignedId}, Option value: ${optionValue}, Match: ${option.selected}`);
              select.appendChild(option);
            });
          }
          
          console.log('Total options in dropdown:', select.options.length);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          const select = modal.querySelector('#assignedTo') as HTMLSelectElement;
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'Failed to load users';
          select.appendChild(option);
        }
      });

      // Add save function to window
      (window as any).saveTask = (button: HTMLButtonElement) => {
        // Check if modal still exists before accessing its elements
        const modalElement = document.querySelector('.modal-overlay');
        if (!modalElement) {
          console.log('Modal not found, cannot save task');
          return;
        }

        console.log('=== TASK SAVE DEBUG ===');
        const taskName = (modalElement.querySelector('#taskName') as HTMLInputElement)?.value;
        const status = (modalElement.querySelector('#status') as HTMLSelectElement)?.value;
        const priority = (modalElement.querySelector('#priority') as HTMLSelectElement)?.value;
        const assignedTo = (modalElement.querySelector('#assignedTo') as HTMLSelectElement)?.value;
        const startDate = (modalElement.querySelector('#startDate') as HTMLInputElement)?.value;
        const dueDate = (modalElement.querySelector('#dueDate') as HTMLInputElement)?.value;
        
        console.log('Form values:', {
          taskName,
          status,
          priority,
          assignedTo,
          startDate,
          dueDate
        });

        if (!taskName) {
          alert('Task name is required');
          return;
        }

        const payload = {
          taskId: task?.taskId,
          taskName: taskName.trim(),
          status,
          priority,
          startDate: startDate ? startDate.split('T')[0] : '',
          dueDate: dueDate ? dueDate.split('T')[0] : '',
          assignedTo
        };

        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving...';

        if (task) {
          this.taskService.updateTask(payload).subscribe({
            next: (res: any) => {
              console.log("Updated", res);
              modal.remove();
              this.getAllTasks();
            },
            error: (err) => {
              console.log("Update Error", err);
              alert('Failed to update task');
              button.disabled = false;
              button.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Update Task';
            }
          });
        } else {
          this.taskService.addTask(payload).subscribe({
            next: (res: any) => {
              console.log("Created", res);
              modal.remove();
              this.getAllTasks();
            },
            error: (err) => {
              console.log("Create Error", err);
              alert('Failed to create task');
              button.disabled = false;
              button.innerHTML = '<i class="fa-solid fa-save mr-2"></i>Create Task';
            }
          });
        }
      };
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

    // GET ALL USERS
    getAllUsers() {
      console.log('Starting getAllUsers()...');
      
      // Check if users are already cached in localStorage
      const cachedUsers = localStorage.getItem('cachedUsers');
      if (cachedUsers) {
        console.log('Using cached users from localStorage');
        this.users = JSON.parse(cachedUsers);
        return;
      }
      
      this.taskService.getUserTasks().subscribe({
        next: (res: any) => {
          console.log("Users API RESPONSE:", res);
          
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
          
          // Cache users in localStorage for persistence
          localStorage.setItem('cachedUsers', JSON.stringify(this.users));
          
          console.log('Available users:', this.users);
          console.log('Users cached for future use');
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.users = [];
        }
      });
    }

    // Get assigned user name
    getAssignedUserName(assignedToId: any): string {
      if (!assignedToId) return '';
      
      console.log('=== getAssignedUserName called ===');
      console.log('Looking for user with assignedToId:', assignedToId, 'type:', typeof assignedToId);
      console.log('Users array length:', this.users.length);
      console.log('Users array populated:', this.users.length > 0);
      
      if (this.users.length === 0) {
        console.log('WARNING: Users array is empty when trying to get assigned user name!');
        return 'Unknown User';
      }
      
      console.log('Available users:', this.users.map(u => ({
        registerId: u.registerId,
        userId: u.userId,
        type: typeof u.registerId,
        name: u.registerName
      })));
      
      const user = this.users.find(u => {
        const userMatches = 
          (u.registerId && String(u.registerId) === String(assignedToId)) || 
          (u.userId && String(u.userId) === String(assignedToId));
        
        if (userMatches) {
          console.log('Found matching user:', u.registerName);
        }
        return userMatches;
      });
      
      const displayName = user ? (user.registerName || user.userName || user.name || user.registerEmail || user.email) : 'Unknown User';
      console.log('Final display name:', displayName);
      console.log('=== getAssignedUserName end ===');
      return displayName;
    }

    // Change view mode
    setViewMode(mode: 'card' | 'table') {
      this.viewMode = mode;
    }
  }