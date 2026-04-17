// // pages/unauthorized/unauthorized.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-unauthorized',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
//       <div class="max-w-md w-full text-center">
//         <div class="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
//           <!-- Lock Icon -->
//           <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
//             <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 00-3 3v2a3 3 0 006 0v-2a3 3 0 00-3-3zM6 9V7a6 6 0 1112 0v2"/>
//             </svg>
//           </div>
          
//           <h1 class="text-2xl font-bold text-white mb-2">Access Denied</h1>
//           <p class="text-gray-400 mb-6">You don't have permission to access this page.</p>
          
//           <div class="space-y-3">
//             <button 
//               (click)="goBack()"
//               class="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-medium transition-all">
//               Go Back
//             </button>
//             <button 
//               (click)="goToDashboard()"
//               class="w-full bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg px-4 py-2 font-medium transition-all">
//               Go to Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class UnauthorizedComponent {
//   constructor(private router: Router) {}

//   goBack() {
//     window.history.back();
//   }

//   goToDashboard() {
//     this.router.navigate(['/admin/dashboard']);
//   }
// }