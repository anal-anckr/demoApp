import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Task } from '../../shared/models/task.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiService = inject(ApiService);
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasks();
  }

  /**
   * Load all tasks from the API
   */
  private loadTasks(): void {
    this.apiService
      .get<any>('tasks')
      .pipe(
        map((response) => {
          // Ensure we have an array, handling various API response formats
          if (Array.isArray(response)) {
            return response;
          } else if (response && typeof response === 'object') {
            // If response is an object with a data/items/tasks property that's an array
            if (Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.items)) return response.items;
            if (Array.isArray(response.tasks)) return response.tasks;

            // If it's an object with task data but not in an array
            if (Object.keys(response).length > 0) {
              // Convert object of tasks to array if they have numeric keys
              const possibleArray = Object.keys(response)
                .filter((key) => !isNaN(Number(key)))
                .map((key) => response[key]);

              if (possibleArray.length > 0) return possibleArray;
            }
          }

          // Default to empty array if we can't make sense of the response
          console.warn('Unexpected API response format for tasks:', response);
          return [];
        }),
        catchError(() => {
          console.error('Failed to fetch tasks from API, using empty array');
          return of([]);
        })
      )
      .subscribe((tasks) => {
        this.tasksSubject.next(tasks);
      });
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Get a task by ID
   */
  getTaskById(id: string): Observable<Task | undefined> {
    return this.apiService.get<any>(`tasks/${id}`).pipe(
      map((response) => {
        // If response is a direct task object
        if (response && typeof response === 'object' && response.id) {
          return response as Task;
        }

        // If response is wrapped in a data/task property
        if (response && typeof response === 'object') {
          if (response.data && response.data.id) return response.data as Task;
          if (response.task && response.task.id) return response.task as Task;
        }

        // If response is not what we expect, log and return undefined
        if (response !== null && response !== undefined) {
          console.warn(
            'Unexpected API response format for task by ID:',
            response
          );
        }

        return undefined;
      }),
      catchError(() => {
        // Fallback to local cache if API fails
        return this.tasks$.pipe(
          map((tasks) => tasks.find((task) => task.id === id))
        );
      })
    );
  }

  /**
   * Add a new task
   */
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.apiService
      .post<any>('tasks', {
        ...task,
        // These will be overridden by the server, but including them for type safety
        id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .pipe(
        map((response) => {
          // If response is a direct task object
          if (response && typeof response === 'object' && response.id) {
            return response as Task;
          }

          // If response is wrapped in a data/task property
          if (response && typeof response === 'object') {
            if (response.data && response.data.id) return response.data as Task;
            if (response.task && response.task.id) return response.task as Task;
          }

          console.warn(
            'Unexpected API response format from task creation:',
            response
          );
          return null;
        }),
        switchMap((newTask) => {
          if (!newTask) return of(null);

          const currentTasks = this.tasksSubject.getValue();
          this.tasksSubject.next([...currentTasks, newTask]);
          return of(newTask);
        }),
        catchError((error) => {
          console.error('Error adding task:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Update a task
   */
  updateTask(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ): void {
    this.apiService
      .put<any>(`tasks/${id}`, updates)
      .pipe(
        map((response) => {
          // If response is a direct task object
          if (response && typeof response === 'object' && response.id) {
            return response as Task;
          }

          // If response is wrapped in a data/task property
          if (response && typeof response === 'object') {
            if (response.data && response.data.id) return response.data as Task;
            if (response.task && response.task.id) return response.task as Task;
          }

          console.warn(
            'Unexpected API response format from task update:',
            response
          );
          return null;
        }),
        switchMap((updatedTask) => {
          if (!updatedTask) return of(null);

          const currentTasks = this.tasksSubject.getValue();
          const taskIndex = currentTasks.findIndex((task) => task.id === id);

          if (taskIndex !== -1) {
            const updatedTasks = [
              ...currentTasks.slice(0, taskIndex),
              updatedTask,
              ...currentTasks.slice(taskIndex + 1),
            ];

            this.tasksSubject.next(updatedTasks);
          }
          return of(updatedTask);
        }),
        catchError((error) => {
          console.error('Error updating task:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): void {
    this.apiService
      .delete<void>(`tasks/${id}`)
      .pipe(
        switchMap(() => {
          const currentTasks = this.tasksSubject.getValue();
          const updatedTasks = currentTasks.filter((task) => task.id !== id);
          this.tasksSubject.next(updatedTasks);
          return of(null);
        }),
        catchError((error) => {
          console.error('Error deleting task:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion(id: string): void {
    this.tasks$
      .pipe(
        take(1),
        switchMap((tasks) => {
          const task = tasks.find((t) => t.id === id);
          if (!task) return of(null);

          return this.apiService
            .put<any>(`tasks/${id}`, {
              completed: !task.completed,
            })
            .pipe(
              map((response) => {
                // If response is a direct task object
                if (response && typeof response === 'object' && response.id) {
                  return response as Task;
                }

                // If response is wrapped in a data/task property
                if (response && typeof response === 'object') {
                  if (response.data && response.data.id)
                    return response.data as Task;
                  if (response.task && response.task.id)
                    return response.task as Task;
                }

                console.warn(
                  'Unexpected API response format from task toggle:',
                  response
                );
                return null;
              })
            );
        }),
        switchMap((updatedTask) => {
          if (!updatedTask) return of(null);

          const currentTasks = this.tasksSubject.getValue();
          const taskIndex = currentTasks.findIndex((task) => task.id === id);

          if (taskIndex !== -1) {
            const updatedTasks = [
              ...currentTasks.slice(0, taskIndex),
              updatedTask,
              ...currentTasks.slice(taskIndex + 1),
            ];

            this.tasksSubject.next(updatedTasks);
          }
          return of(updatedTask);
        }),
        catchError((error) => {
          console.error('Error toggling task completion:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
