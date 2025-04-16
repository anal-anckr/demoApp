import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { switchMap, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Task } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="task-form-container">
      <h2>{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h2>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title*</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            placeholder="Enter task title"
          />
          <div
            *ngIf="title.invalid && (title.dirty || title.touched)"
            class="error-message"
          >
            <span *ngIf="title.errors?.['required']">Title is required</span>
            <span *ngIf="title.errors?.['maxlength']"
              >Title cannot exceed 100 characters</span
            >
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description*</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Enter task description"
            rows="4"
          ></textarea>
          <div
            *ngIf="
              description.invalid && (description.dirty || description.touched)
            "
            class="error-message"
          >
            <span *ngIf="description.errors?.['required']"
              >Description is required</span
            >
            <span *ngIf="description.errors?.['maxlength']"
              >Description cannot exceed 500 characters</span
            >
          </div>
        </div>

        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input type="date" id="dueDate" formControlName="dueDate" />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" formControlName="completed" />
            Mark as completed
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" [routerLink]="['/tasks']">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="taskForm.invalid || taskForm.pristine"
          >
            {{ isEditMode ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .task-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    input[type="text"],
    input[type="date"],
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }
    
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      background-color: #007bff;
      color: white;
    }
    
    button[disabled] {
      background-color: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .cancel-btn {
      background-color: #6c757d;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
  `,
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  taskForm!: FormGroup;
  isEditMode = false;
  taskId: string | null = null;

  get title() {
    return this.taskForm.get('title')!;
  }
  get description() {
    return this.taskForm.get('description')!;
  }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.taskId = id;
          this.isEditMode = !!id;

          if (this.isEditMode && id) {
            return this.taskService.getTaskById(id).pipe(take(1));
          }

          return of(null);
        })
      )
      .subscribe((task) => {
        if (task) {
          this.patchFormValues(task);
        }
      });
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      dueDate: [null],
      completed: [false],
    });
  }

  private patchFormValues(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : null,
      completed: task.completed,
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValues = this.taskForm.value;

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, {
        title: formValues.title,
        description: formValues.description,
        dueDate: formValues.dueDate ? new Date(formValues.dueDate) : undefined,
        completed: formValues.completed,
      });
    } else {
      this.taskService.addTask({
        title: formValues.title,
        description: formValues.description,
        dueDate: formValues.dueDate ? new Date(formValues.dueDate) : undefined,
        completed: formValues.completed,
      });
    }

    this.router.navigate(['/tasks']);
  }
}
