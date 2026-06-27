import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/shared/api/queryClient';
import { ToastProvider } from '@/shared/ui';
import { AuthProvider } from './auth/AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composition root for global providers:
 * QueryClientProvider -> BrowserRouter -> AuthProvider.
 *
 * AuthProvider sits inside BrowserRouter so auth guards can use router hooks,
 * and inside QueryClientProvider so authed queries share one cache.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
