import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Tasks routes - protected by auth guard
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
  },

  // Redirect to login for unknown routes
  {
    path: '**',
    redirectTo: 'login',
  },
];
