import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardStateService } from '@features/dashboard/state/dashboard-state.service';

describe('DashboardStateService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the starter dashboard summary', () => {
    const state = TestBed.inject(DashboardStateService);

    state.loadDashboard();

    expect(state.loading()).toBe(true);
    expect(state.error()).toBeNull();

    vi.runAllTimers();

    expect(state.loading()).toBe(false);
    expect(state.summary()).toEqual({
      activeUsers: 42,
      openProjects: 8,
      testCoverage: '87%',
      securityStatus: 'healthy',
    });
    expect(state.hasData()).toBe(true);
  });

  it('stores a terminal error state', () => {
    const state = TestBed.inject(DashboardStateService);

    state.setError('Could not load dashboard');

    expect(state.loading()).toBe(false);
    expect(state.error()).toBe('Could not load dashboard');
  });
});
