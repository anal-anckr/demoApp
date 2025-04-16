import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1 [routerLink]="['/tasks']">Task Manager</h1>
          </div>

          <div class="user-menu" *ngIf="isAuthenticated()">
            <div class="user-info">
              <span>{{ currentUser()?.username }}</span>
            </div>

            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: `
    .app-header {
      background-color: #007bff;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo h1 {
      margin: 0;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .user-info {
      font-weight: 500;
    }
    
    .logout-btn {
      background-color: transparent;
      border: 1px solid white;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Convert observables to signals for better performance
  currentUser = toSignal(this.authService.currentUser$, { initialValue: null });
  isAuthenticated = toSignal(this.authService.isAuthenticated$, {
    initialValue: false,
  });

  logout(): void {
    this.authService.logout();
  }
}
