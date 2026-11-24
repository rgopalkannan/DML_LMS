/*
 * Holds the access token. Kept in sessionStorage so a reload keeps the user signed in but closing the tab signs them out.
 * Storage can be unavailable (private mode, blocked site data), so every access is guarded.
 */
const KEY = 'dml-lms.access-token';
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = sessionStorage.getItem(KEY);
    } catch {
      memoryToken = null;
    }
    return memoryToken;
  },
  set(token: string): void {
    memoryToken = token;
    try {
      sessionStorage.setItem(KEY, token);
    } catch {
      /* stays in memory only */
    }
  },
  clear(): void {
    memoryToken = null;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* nothing stored */
    }
  }
};
