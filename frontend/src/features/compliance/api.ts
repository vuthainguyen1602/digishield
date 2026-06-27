import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetchers + hooks for the Compliance screen.
 *
 * Mirror `CompliancePolicyView` (`GET /compliance/policies`) and
 * `ComplianceStatusView` (`GET /compliance/status`) from the learning module.
 * These records carry no `@JsonProperty`, so Jackson emits plain camelCase
 * field names matching the Java record components.
 */

/** Wire shape of `CompliancePolicyView`. */
export interface CompliancePolicy {
  id: string;
  name: string | null;
  framework: string | null;
  dueRule: string | null;
  mandatory: boolean;
  completionPct: number;
}

/** Wire shape of `ComplianceStatusView` (KPI tiles). */
export interface ComplianceStatus {
  compliantPct: number;
  compliantCount: number;
  totalCount: number;
  overdueCount: number;
  policyCount: number;
  completedCount: number;
  dueSoonCount: number;
}

/** GET /compliance/policies — mandatory-policy completion list. */
export function fetchCompliancePolicies(signal?: AbortSignal): Promise<CompliancePolicy[]> {
  return apiRequest<CompliancePolicy[]>({
    url: '/compliance/policies',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** GET /compliance/status — aggregated compliance KPIs. */
export function fetchComplianceStatus(signal?: AbortSignal): Promise<ComplianceStatus> {
  return apiRequest<ComplianceStatus>({
    url: '/compliance/status',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** TanStack Query hook for the compliance policy list. */
export function useCompliancePolicies() {
  return useQuery({
    queryKey: queryKeys.compliancePolicies,
    queryFn: ({ signal }) => fetchCompliancePolicies(signal),
  });
}

/** TanStack Query hook for the compliance KPI tiles. */
export function useComplianceStatus() {
  return useQuery({
    queryKey: queryKeys.complianceStatus,
    queryFn: ({ signal }) => fetchComplianceStatus(signal),
  });
}
