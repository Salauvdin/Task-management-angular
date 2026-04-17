import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Routes } from '@angular/router';
import { Router } from 'express';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Admin } from './pages/admin/admin';
import { Login } from './pages/login/login';
// import { Managar } from './pages/managar/managar';
import { Register } from './pages/register/register';
import { TeamMember } from './pages/team-member/team-member';
import { FormsModule, NgModel } from '@angular/forms';
import { SidebarComponent } from './componets/sidebar/sidebar';
import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet,FormsModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
