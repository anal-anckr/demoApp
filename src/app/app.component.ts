import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      <app-header></app-header>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <p>&copy; {{ currentYear }} Task Manager App</p>
      </footer>
    </div>
  `,
  styles: `
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-content {
      flex: 1;
      padding: 1rem;
      background-color: #f8f9fa;
    }
    
    .app-footer {
      padding: 1rem;
      background-color: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #6c757d;
    }
  `,
})
export class AppComponent {
  title = 'demo-app';
  currentYear = new Date().getFullYear();
}
