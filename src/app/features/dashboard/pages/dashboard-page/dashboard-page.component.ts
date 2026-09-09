import { Component, inject } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { StatusCardComponent } from '@shared/ui/status-card/status-card.component';
import { DashboardStateService } from '@features/dashboard/state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [NzAlertModule, NzSkeletonModule, StatusCardComponent],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  protected readonly dashboardState = inject(DashboardStateService);

  constructor() {
    this.dashboardState.loadDashboard();
  }
}
