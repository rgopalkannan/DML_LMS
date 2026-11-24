import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/api-error';

const STALE_MS = 30_000;
const MAX_RETRIES = 2;

/** Retries only failures that may pass on a second try (network, timeouts, 5xx), never 4xx answers. */
const shouldRetry = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_RETRIES && error instanceof ApiError && (error.status === null || error.status >= 500);

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_MS, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false }
    }
  });
