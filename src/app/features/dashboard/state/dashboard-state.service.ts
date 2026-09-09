import { computed, Injectable, signal } from '@angular/core';

import { DashboardSummary } from '@features/dashboard/models/dashboard.models';

const STARTER_SUMMARY: DashboardSummary = {
  activeUsers: 42,
  openProjects: 8,
  testCoverage: '87%',
  securityStatus: 'healthy',
};

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private readonly summaryState = signal<DashboardSummary | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly summary = this.summaryState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasData = computed(() => this.summaryState() !== null);

  loadDashboard(): void {
    if (this.loadingState()) {
      return;
    }
    this.loadingState.set(true);
    this.errorState.set(null);

    setTimeout(() => {
      this.summaryState.set(STARTER_SUMMARY);
      this.loadingState.set(false);
    }, 150);
  }

  setError(error: string): void {
    this.errorState.set(error);
    this.loadingState.set(false);
  }
}
