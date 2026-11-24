import { createContext, useContext } from 'react';
import type { Role, SessionUser } from '@/types/api';

export interface AuthState {
  user: SessionUser | null;
  /** True while a stored token is being checked on start-up. */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
