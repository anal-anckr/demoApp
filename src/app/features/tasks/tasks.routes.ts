import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/task-form/task-form.component').then(
        (m) => m.TaskFormComponent
      ),
  },
];
