import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <!-- Background decorative elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="card max-w-lg w-full mx-4 relative z-10 backdrop-blur-sm bg-white/90 border border-white/20 shadow-2xl text-center">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl mb-6">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Signing you out...</h2>
        <p class="text-xl text-gray-600">Please wait while we log you out safely</p>
      </div>
    </div>
  `
})
export class LogoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      await this.authService.signOut();
      // The signOut method already handles navigation to /login
    } catch (error) {
      console.error('Error during logout:', error);
      // If there's an error, still redirect to login
      this.router.navigate(['/login']);
    }
  }
}
