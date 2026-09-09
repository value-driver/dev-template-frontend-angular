export interface DashboardSummary {
  activeUsers: number;
  openProjects: number;
  testCoverage: string;
  securityStatus: 'healthy' | 'attention';
}
