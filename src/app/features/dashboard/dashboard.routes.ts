import { Routes } from '@angular/router';

import { DashboardPageComponent } from '@features/dashboard/pages/dashboard-page/dashboard-page.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
  },
];
