import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Task } from '../../../../shared/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, AsyncPipe, RouterLink, DatePipe],
  template: `
    <div class="task-list-container">
      <div class="task-list-header">
        <h2>My Tasks</h2>
        <div class="task-filters">
          <button
            [ngClass]="{ active: filter === 'all' }"
            (click)="setFilter('all')"
          >
            All
          </button>
          <button
            [ngClass]="{ active: filter === 'active' }"
            (click)="setFilter('active')"
          >
            Active
          </button>
          <button
            [ngClass]="{ active: filter === 'completed' }"
            (click)="setFilter('completed')"
          >
            Completed
          </button>
        </div>
        <button class="add-task-btn" [routerLink]="['/tasks/new']">
          Add Task
        </button>
      </div>

      <div class="tasks-wrapper">
        <ng-container *ngIf="tasks$ | async as tasks">
          <div class="no-tasks" *ngIf="tasks.length === 0">
            No tasks found. Add a new task to get started!
          </div>

          <div
            class="task-item"
            *ngFor="let task of tasks"
            [ngClass]="{ completed: task.completed }"
          >
            <div class="task-checkbox">
              <input
                type="checkbox"
                [checked]="task.completed"
                (change)="toggleTaskStatus(task.id)"
              />
            </div>
            <div class="task-content" [routerLink]="['/tasks', task.id]">
              <h3>{{ task.title }}</h3>
              <p>{{ task.description }}</p>
              <div class="task-date">
                <span *ngIf="task.dueDate"
                  >Due: {{ task.dueDate | date : 'mediumDate' }}</span
                >
              </div>
            </div>
            <div class="task-actions">
              <button [routerLink]="['/tasks', task.id, 'edit']">Edit</button>
              <button class="delete-btn" (click)="deleteTask(task.id)">
                Delete
              </button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: `
    .task-list-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .task-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .task-filters {
      display: flex;
      gap: 10px;
    }

    .task-filters button {
      background: none;
      border: 1px solid #ccc;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }

    .task-filters button.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }

    .add-task-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .tasks-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      gap: 12px;
    }

    .task-item.completed {
      background-color: #f8f9fa;
    }

    .task-item.completed .task-content h3 {
      text-decoration: line-through;
      color: #6c757d;
    }

    .task-content {
      flex: 1;
      cursor: pointer;
    }

    .task-content h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .task-content p {
      margin: 0 0 8px 0;
      color: #6c757d;
    }

    .task-date {
      font-size: 14px;
      color: #6c757d;
    }

    .task-actions {
      display: flex;
      gap: 8px;
    }

    .task-actions button {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }

    .delete-btn {
      background-color: #dc3545 !important;
    }

    .no-tasks {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      border: 1px dashed #ccc;
      border-radius: 8px;
    }
  `,
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  tasks$: Observable<Task[]>;
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    this.tasks$ = this.getFilteredTasks();
  }

  setFilter(filterType: 'all' | 'active' | 'completed'): void {
    this.filter = filterType;
    this.tasks$ = this.getFilteredTasks();
  }

  getFilteredTasks(): Observable<Task[]> {
    return this.taskService.getAllTasks().pipe(
      map((tasks) => {
        switch (this.filter) {
          case 'active':
            return tasks.filter((task) => !task.completed);
          case 'completed':
            return tasks.filter((task) => task.completed);
          default:
            return tasks;
        }
      })
    );
  }

  toggleTaskStatus(id: string): void {
    this.taskService.toggleTaskCompletion(id);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }
}
