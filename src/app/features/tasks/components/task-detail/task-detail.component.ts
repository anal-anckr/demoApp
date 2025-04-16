import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Task } from '../../../../shared/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="task-detail-container" *ngIf="task$ | async as task">
      <div class="task-header">
        <h2>Task Details</h2>
        <div class="task-actions">
          <button class="edit-btn" [routerLink]="['/tasks', task.id, 'edit']">
            Edit
          </button>
          <button class="delete-btn" (click)="deleteTask(task.id)">
            Delete
          </button>
        </div>
      </div>

      <div class="task-info">
        <div
          class="task-status"
          [ngClass]="{ completed: task.completed, active: !task.completed }"
        >
          {{ task.completed ? 'Completed' : 'Active' }}
        </div>

        <h3 class="task-title">{{ task.title }}</h3>

        <div class="task-description">
          <p>{{ task.description }}</p>
        </div>

        <div class="task-dates">
          <div *ngIf="task.dueDate" class="due-date">
            <strong>Due Date:</strong> {{ task.dueDate | date : 'medium' }}
          </div>

          <div class="created-date">
            <strong>Created:</strong> {{ task.createdAt | date : 'medium' }}
          </div>

          <div class="updated-date">
            <strong>Last Updated:</strong>
            {{ task.updatedAt | date : 'medium' }}
          </div>
        </div>

        <div class="task-controls">
          <button
            class="complete-btn"
            [ngClass]="{ complete: !task.completed, undo: task.completed }"
            (click)="toggleTaskStatus(task.id)"
          >
            {{ task.completed ? 'Mark as Active' : 'Mark as Complete' }}
          </button>
        </div>
      </div>

      <div class="back-link">
        <a [routerLink]="['/tasks']">← Back to Tasks</a>
      </div>
    </div>
  `,
  styles: `
    .task-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .task-actions {
      display: flex;
      gap: 10px;
    }
    
    .task-actions button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: white;
    }
    
    .edit-btn {
      background-color: #007bff;
    }
    
    .delete-btn {
      background-color: #dc3545;
    }
    
    .task-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .task-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    
    .task-status.completed {
      background-color: #28a745;
      color: white;
    }
    
    .task-status.active {
      background-color: #ffc107;
      color: #212529;
    }
    
    .task-title {
      font-size: 24px;
      margin-bottom: 16px;
    }
    
    .task-description {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .task-dates {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #6c757d;
    }
    
    .task-controls {
      margin-top: 30px;
    }
    
    .complete-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: white;
    }
    
    .complete-btn.complete {
      background-color: #28a745;
    }
    
    .complete-btn.undo {
      background-color: #6c757d;
    }
    
    .back-link {
      margin-top: 30px;
    }
    
    .back-link a {
      color: #007bff;
      text-decoration: none;
    }
    
    .back-link a:hover {
      text-decoration: underline;
    }
  `,
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  task$!: Observable<Task | undefined>;

  ngOnInit(): void {
    this.task$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.taskService.getTaskById(id);
      })
    );
  }

  toggleTaskStatus(id: string): void {
    this.taskService.toggleTaskCompletion(id);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
      // Navigate back to tasks list
      window.history.back();
    }
  }
}
