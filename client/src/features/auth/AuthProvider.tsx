import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { authApi } from '@/api/endpoints';
import { setSessionExpiredListener } from '@/api/http-client';
import { tokenStore } from '@/api/token-store';
import type { Role, SessionUser } from '@/types/api';
import { AuthContext, type AuthState } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [restoring, setRestoring] = useState(() => tokenStore.get() !== null);

  const signOut = useCallback((): void => {
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredListener(() => setUser(null));
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setRestoring(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await authApi.login(email, password);
    tokenStore.set(response.accessToken);
    const { id, name, role } = response.user;
    setUser({ id, email: response.user.email, name, role });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      restoring,
      signIn,
      signOut,
      hasRole: (...roles: Role[]) => user !== null && roles.includes(user.role)
    }),
    [user, restoring, signIn, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
