import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dialog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <form [formGroup]="form" class="grid gap-4">

    <div class="grid gap-2">
      <label>Name</label>
      <input formControlName="name" class="border p-2 rounded bg-gray-800 text-white"/>
    </div>

    <div class="grid gap-2">
      <label>Email</label>
      <input formControlName="email" class="border p-2 rounded bg-gray-800 text-white"/>
    </div>

    <div class="grid gap-2">
      <label>Role</label>
      <select formControlName="role" class="border p-2 rounded bg-gray-800 text-white">
        <option>Admin</option>
        <option>Manager</option>
        <option>Member</option>
      </select>
    </div>

    <div class="grid gap-2">
      <label>Project</label>
      <select formControlName="projects" class="border p-2 rounded bg-gray-800 text-white">
        <option>Website UI</option>
        <option>Mobile App</option>
        <option>API Development</option>
      </select>
    </div>

  </form>
  `
})
export class UserDialogForm {

  private data = inject(Z_MODAL_DATA);

  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl(''),
    projects: new FormControl('')
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

}