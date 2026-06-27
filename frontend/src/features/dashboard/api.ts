import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetchers + hooks for the Admin dashboard.
 *
 * Mirrors `DashboardDto` from the analytics module
 * (`GET /analytics/dashboard`). The BE emits snake_case field names via
 * `@JsonProperty`, so the types match the wire format exactly.
 */

export interface DashboardOpenAlerts {
  total: number;
  critical: number;
  warning: number;
}

export interface DashboardTrendPoint {
  date: string;
  value: number;
}

export interface DashboardBenchmark {
  label: string;
  value: number;
  strong: boolean;
}

export interface DashboardDepartment {
  name: string;
  score: number;
}

/** AI label as emitted by the BE (lowercase). */
export type AiLabel = 'clean' | 'spam' | 'threat';

export interface DashboardRecentReport {
  id: string;
  title: string;
  who: string;
  age: string;
  ai_label: AiLabel | string;
}

export interface DashboardData {
  risk_score: number;
  risk_delta: number;
  phish_prone_pct: number;
  phish_prone_pct_delta: number;
  industry_avg_pct: number;
  training_completion: number;
  open_alerts: DashboardOpenAlerts;
  risk_trend: DashboardTrendPoint[];
  benchmarks: DashboardBenchmark[];
  departments: DashboardDepartment[];
  recent_reports: DashboardRecentReport[];
}

/** GET /analytics/dashboard — aggregated KPIs + trend + departments + reports. */
export function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return apiRequest<DashboardData>({
    url: '/analytics/dashboard',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** TanStack Query hook powering {@link AdminDashboardPage}. */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => fetchDashboard(signal),
  });
}
