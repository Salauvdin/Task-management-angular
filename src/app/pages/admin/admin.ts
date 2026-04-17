import { SidebarComponent } from '@/componets/sidebar/sidebar';
import { Component } from '@angular/core';
// import { Sidebar } from '../../componets/sidebar/sidebar';
import { RouterModule } from '@angular/router';
// import { Sidebar } from 'node_modules/lucide-angular/aliases/aliases';
  


@Component({
  selector: 'app-admin',
  imports: [SidebarComponent,RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {}
