import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

/**
 * Shared TanStack Query client.
 * - Sensible stale time so dashboards don't refetch on every focus.
 * - Do not retry on 4xx (auth/validation errors won't resolve via retry).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
