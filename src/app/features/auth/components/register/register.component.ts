import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register</h2>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              autocomplete="username"
            />
            <div
              *ngIf="username.invalid && (username.dirty || username.touched)"
              class="validation-error"
            >
              <div *ngIf="username.errors?.['required']">
                Username is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              autocomplete="new-password"
            />
            <div
              *ngIf="password.invalid && (password.dirty || password.touched)"
              class="validation-error"
            >
              <div *ngIf="password.errors?.['required']">
                Password is required
              </div>
              <div *ngIf="password.errors?.['minlength']">
                Password must be at least 6 characters
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="registerForm.invalid || loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>

        <div class="alternate-action">
          Already have an account? <a [routerLink]="['/login']">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .register-card {
      width: 100%;
      max-width: 400px;
      padding: 30px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-bottom: 24px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .form-actions {
      margin-top: 30px;
    }
    
    button {
      width: 100%;
      padding: 12px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    
    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    .alternate-action {
      margin-top: 20px;
      text-align: center;
    }
    
    .alternate-action a {
      color: #007bff;
      text-decoration: none;
    }
    
    .validation-error {
      margin-top: 5px;
      color: #dc3545;
      font-size: 14px;
    }
    
    .error-message {
      padding: 10px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  get username() {
    return this.registerForm.get('username')!;
  }
  get password() {
    return this.registerForm.get('password')!;
  }

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.message || 'Registration failed. Please try again.';
      },
    });
  }
}
