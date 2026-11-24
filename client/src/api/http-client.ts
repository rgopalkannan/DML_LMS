import axios from 'axios';
import { ERROR_CODES } from '@/constants/error-codes';
import { LIMITS } from '@/constants/labels';
import { toApiError } from './api-error';
import { tokenStore } from './token-store';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/** The only HTTP client. It adds the token, applies the timeout and turns every failure into an ApiError. */
export const http = axios.create({ baseURL: API_BASE_URL, timeout: LIMITS.REQUEST_TIMEOUT_MS });

type SessionExpiredListener = () => void;
let onSessionExpired: SessionExpiredListener = () => undefined;

export function setSessionExpiredListener(listener: SessionExpiredListener): void {
  onSessionExpired = listener;
}

http.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  response => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.code === ERROR_CODES.UNAUTHENTICATED) {
      tokenStore.clear();
      onSessionExpired();
    }
    return Promise.reject(apiError);
  }
);
