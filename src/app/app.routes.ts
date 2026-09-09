import { Routes } from '@angular/router';

import { authChildGuard } from '@core/auth/auth.guard';
import { AuthenticatedLayoutComponent } from '@layout/authenticated-layout/authenticated-layout.component';
import { AuthLayoutComponent } from '@layout/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from '@layout/blank-layout/blank-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivateChild: [authChildGuard],
    data: { layout: 'authenticated' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        data: {
          title: 'System Dashboard',
          subtitle: 'Enterprise application overview and system performance metrics',
          breadcrumb: 'Dashboard',
        },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES),
      },
      {
        path: 'settings',
        data: {
          title: 'Settings & Security',
          subtitle: 'Hardware-backed AES-256-GCM storage preferences and UI configurations',
          breadcrumb: 'Settings',
        },
        loadChildren: () =>
          import('./features/settings/settings.routes').then((routes) => routes.SETTINGS_ROUTES),
      },
    ],
  },

  {
    path: 'auth',
    component: AuthLayoutComponent,
    data: { layout: 'auth' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        data: {
          title: 'Sign In',
          breadcrumb: 'Sign In',
        },
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
    ],
  },

  {
    path: 'reports',
    component: BlankLayoutComponent,
    data: { layout: 'blank' },
    children: [
      {
        path: 'print',
        data: {
          title: 'Compliance Audit Report',
          breadcrumb: 'Compliance Report',
        },
        loadComponent: () =>
          import('./features/reports/pages/print-report-page/print-report-page.component').then(
            (m) => m.PrintReportPageComponent,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
