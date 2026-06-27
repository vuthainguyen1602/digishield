import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetcher + hook for the SOC watchlist / blacklist.
 *
 * Mirrors `BlacklistEntryDto` from the reporting module (`GET /blacklist`).
 * Field names map 1:1 via `@JsonProperty` (id/type/value/source). `type` is
 * lower-case (e.g. "url", "phone", "domain", "bank").
 */
export interface BlacklistEntry {
  id: string;
  type: string | null;
  value: string | null;
  source: string | null;
}

/** GET /blacklist — the tenant's blacklist / watchlist entries. */
export function fetchBlacklist(signal?: AbortSignal): Promise<BlacklistEntry[]> {
  return apiRequest<BlacklistEntry[]>({
    url: '/blacklist',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** TanStack Query hook powering {@link WatchlistPage}. */
export function useBlacklist() {
  return useQuery({
    queryKey: queryKeys.blacklist,
    queryFn: ({ signal }) => fetchBlacklist(signal),
  });
}
