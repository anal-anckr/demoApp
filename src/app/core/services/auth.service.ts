import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, from } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

export interface User {
  id: number;
  username: string;
  // No password as it's excluded from the response
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  // Using signals instead of BehaviorSubject
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // Expose signals as observables for compatibility with existing code
  readonly currentUser$ = toObservable(this.currentUserSignal);
  readonly isAuthenticated$ = toObservable(this.isAuthenticatedSignal);

  constructor() {
    this.loadStoredAuth();
  }

  /**
   * Load authentication state from local storage
   */
  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);

    if (token && userData) {
      const user = JSON.parse(userData);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      switchMap((response) => {
        this.setSession(response);
        this.currentUserSignal.set(response.user);
        this.isAuthenticatedSignal.set(true);
        return of(response.user);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return of(null as any);
      })
    );
  }

  /**
   * Register a new user
   */
  register(data: RegisterData): Observable<User> {
    return this.apiService.post<AuthResponse>('auth/register', data).pipe(
      switchMap((response) => {
        this.setSession(response);
        this.currentUserSignal.set(response.user);
        this.isAuthenticatedSignal.set(true);
        return of(response.user);
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        throw error;
      })
    );
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Store auth token and user data
   */
  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
  }

  /**
   * Check if the user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
