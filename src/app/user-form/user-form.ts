import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSelectComponent } from '@/shared/components/select';
import { ZardSelectItemComponent } from '@/shared/components/select';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent
  ],
  template: `

  <div class="grid gap-4">

    <input z-input placeholder="User Name" [(ngModel)]="user.name"/>

    <input z-input placeholder="User Email" [(ngModel)]="user.email"/>

    <z-select [(ngModel)]="user.role">
      <z-select-item zValue="Admin">Admin</z-select-item>
      <z-select-item zValue="Manager">Manager</z-select-item>
      <z-select-item zValue="Member">Member</z-select-item>
    </z-select>

    <z-select [(ngModel)]="user.projects">
      <z-select-item zValue="Website UI">Website UI</z-select-item>
      <z-select-item zValue="Mobile App">Mobile App</z-select-item>
      <z-select-item zValue="API Development">API Development</z-select-item>
    </z-select>

  </div>
  `
})
export class UserForm {

  data = inject(Z_MODAL_DATA)

  user:any={
    name:'',
    email:'',
    role:'',
    projects:''
  }

}