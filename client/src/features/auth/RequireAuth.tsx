import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import type { Role } from '@/types/api';
import { useAuth } from './auth-context';

/** Route guard for signed-in users, optionally limited to some roles. The API checks the same rules. */
export function RequireAuth({ roles }: { roles?: Role[] }): ReactElement {
  const { user, restoring } = useAuth();
  const location = useLocation();
  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand">
        <Spinner label="Checking your session" />
      </div>
    );
  }
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role))
    return (
      <EmptyState title="You do not have access to this page" description="Ask an administrator if you need it." />
    );
  return <Outlet />;
}
