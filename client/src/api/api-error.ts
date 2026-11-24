import { isAxiosError } from 'axios';
import { ERROR_CODES, type ErrorCode } from '@/constants/error-codes';

/** The one error type screens handle: a code to branch on and a message that is safe to show. */
export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status: number | null,
    readonly details: string[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

const KNOWN = new Set<string>(Object.values(ERROR_CODES));

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError<ErrorBody>(error)) {
    if (error.code === 'ECONNABORTED')
      return new ApiError(ERROR_CODES.TIMEOUT, 'The server took too long to answer. Try again.', null);
    if (!error.response)
      return new ApiError(ERROR_CODES.NETWORK, 'Cannot reach the server. Check your connection.', null);
    const body = error.response.data?.error;
    const code = body?.code && KNOWN.has(body.code) ? (body.code as ErrorCode) : ERROR_CODES.INTERNAL;
    const details = Array.isArray(body?.details)
      ? body.details.filter((item): item is string => typeof item === 'string')
      : [];
    return new ApiError(
      code,
      body?.message ?? 'Something went wrong. Please try again.',
      error.response.status,
      details
    );
  }
  return new ApiError(ERROR_CODES.INTERNAL, 'Something went wrong. Please try again.', null);
}
