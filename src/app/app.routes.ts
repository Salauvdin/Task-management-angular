import { RouterModule, Routes } from '@angular/router';
import { Admin } from './pages/admin/admin';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { TeamMember } from './pages/team-member/team-member';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { NgModule } from '@angular/core';
import { Reports } from './confiq/reports/reports';
import { Users } from './features/users/users';
import { ConfigurationComponents } from './confiq/configuration.compoents/configuration.compoents';
import { UserFormComponent } from './features/users/user-form';
import { TeamsComponent } from './pages/teams/teams';
// import { UnauthorizedComponent } from './pages/unauthorized/unauthorized';
import { authGuard } from './guards/auth-guard';
import { CreateTeamComponent } from './features/create-team/create-team';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // { path: 'unauthorized', component: UnauthorizedCom ponent },
  
  // Admin routes
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [authGuard],
        data: { permission: { menu: 'View Dashboard', action: 'read' } }
      },
      { 
        path: 'tasks', 
        component: Tasks,
        canActivate: [authGuard],
        data: { permission: { menu: 'Tasks', action: 'read' } }
      },
      { 
        path: 'reports', 
        component: Reports,
        canActivate: [authGuard],
        data: { permission: { menu: 'Reports', action: 'read' } }
      },
      { 
        path: 'users', 
        component: Users,
        canActivate: [authGuard],
        data: { permission: { menu: 'User Management', action: 'read' } }
      },
      { 
        path: 'teams', 
        component: TeamsComponent,
        canActivate: [authGuard],
        data: { permission: { menu: 'Teams', action: 'read' } }
      },
      { 
        path: 'users/create', 
        component: UserFormComponent,
        canActivate: [authGuard],
        data: { permission: { menu: 'User Management', action: 'write' } }
      },
      { 
        path: 'users/edit/:id', 
        component: UserFormComponent,
        canActivate: [authGuard],
        data: { permission: { menu: 'User Management', action: 'write' } }
      },
      { 
        path: 'configuration', 
        component: ConfigurationComponents,
        canActivate: [authGuard],
        data: { permission: { menu: 'Configuration', action: 'read' } }
      },
      { 
        path: 'create-team', 
        component: CreateTeamComponent,
        canActivate: [authGuard],
        data: { permission: { menu: 'Team Management', action: 'write' } }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Manager routes (separate route)
  {
    path: 'manager',
    component: Admin,  // Or create a separate Manager component
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        component: Dashboard,
        canActivate: [authGuard],
        data: { permission: { menu: 'View Dashboard', action: 'read' } }
      },
      { 
        path: 'tasks', 
        component: Tasks,
        canActivate: [authGuard],
        data: { permission: { menu: 'Tasks', action: 'read' } }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Team Member routes (separate route)
  {
    path: 'teammember',
    component: Admin,  // Or create a separate TeamMember component
    canActivate: [authGuard],
    children: [
      { 
        path: 'tasks', 
        component: Tasks,
        canActivate: [authGuard],
        data: { permission: { menu: 'Tasks', action: 'read' } }
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  
  // Redirect any unknown routes to login
  // { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}