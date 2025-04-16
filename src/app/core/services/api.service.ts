import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, options = {}): Observable<T> {
    return this.http
      .get<T>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, data: any, options = {}): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}/${endpoint}`, data, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, data: any, options = {}): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}/${endpoint}`, data, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, options = {}): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
