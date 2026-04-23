import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@/componets/sidebar/sidebar';

@Component({
  selector: 'app-admin',
  imports: [RouterModule, SidebarComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {}
