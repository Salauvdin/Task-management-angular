import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectComponent, ZardSelectItemComponent } from '@/shared/components/select';

import { TaskService } from '@/services/task';

@Component({
  standalone: true,

  imports: [
    FormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent
  ],

template: `


  

    <!-- Title -->
    <h2 class="text-lg font-semibold text-white text-center">
      {{ task?.taskId ? 'Edit Task' : 'Create Task' }}
    </h2>

    <!-- Task Name -->
   <div>
  <label class="text-sm text-gray-300">Task Name</label>
  <input
    z-input
    placeholder="Enter task name"
    [(ngModel)]="task.taskName"
    class="w-full mt-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg whitespace-nowrap"
  />
</div>

    <!-- Status -->
    <div>
      <label class="text-sm text-gray-300">Status</label>
      <z-select [(ngModel)]="task.Statues">
        <z-select-item zValue="Pending">Pending</z-select-item>
        <z-select-item zValue="In Progress">In Progress</z-select-item>
        <z-select-item zValue="Completed">Completed</z-select-item>
      </z-select>
    </div>

    <!-- Priority -->
    <div>
      <label class="text-sm text-gray-300">Priority</label>
      <z-select [(ngModel)]="task.Priorty">
        <z-select-item zValue="Low">Low</z-select-item>
        <z-select-item zValue="Medium">Medium</z-select-item>
        <z-select-item zValue="High">High</z-select-item>
      </z-select>
    </div>

    <!-- Date -->
    <div>
      <label class="text-sm text-gray-300">Start Date</label>
      <input
        type="date"
        z-input
        [(ngModel)]="task.startDate"
        class="w-full mt-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
      />
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
    startDate:''
  }
  constructor(){
    if(this.data){
      this.task = { ...this.data }
    }
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