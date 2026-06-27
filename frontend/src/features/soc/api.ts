import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetchers + hooks for the SOC inbox.
 *
 * Mirrors `PhishingReportDto` from the reporting module
 * (`GET /reports/phishing?status=`). These fields are emitted as camelCase
 * (the BE uses `@JsonProperty("aiLabel")` etc.).
 */

/** AI classification as emitted by the BE (lowercase). */
export type AiLabel = 'clean' | 'spam' | 'threat';

export interface PhishingReport {
  id: string;
  userId: string | null;
  reporter: string | null;
  subject: string | null;
  sender: string | null;
  payload: string | null;
  aiLabel: AiLabel | string;
  aiConfidence: number;
  reasoning: string | null;
  blacklistMatch: boolean;
  status: string | null;
  ageLabel: string | null;
}

/** GET /reports/phishing — SOC inbox queue, optionally filtered by status. */
export function fetchPhishingReports(
  status?: string,
  signal?: AbortSignal,
): Promise<PhishingReport[]> {
  return apiRequest<PhishingReport[]>({
    url: '/reports/phishing',
    method: 'GET',
    ...(status ? { params: { status } } : {}),
    ...(signal ? { signal } : {}),
  });
}

/** TanStack Query hook powering {@link SocInboxPage}. */
export function usePhishingReports(status?: string) {
  return useQuery({
    queryKey: queryKeys.phishingReports(status),
    queryFn: ({ signal }) => fetchPhishingReports(status, signal),
  });
}
