import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { AuthContext, type AuthState } from '@/features/auth/auth-context';
import type { SessionUser } from '@/types/api';

export const learner: SessionUser = { id: 'u1', email: 'l@example.com', name: 'Lena Learner', role: 'LEARNER' };

export function authState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: learner,
    restoring: false,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn(),
    hasRole: (...roles) => roles.includes(overrides.user?.role ?? learner.role),
    ...overrides
  };
}

/** Renders routes with a fresh query cache and a stubbed auth state. */
export function renderRoutes(routes: RouteObject[], path: string, auth: AuthState = authState()): RenderResult {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const tree: ReactElement = (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
  return render(tree);
}
