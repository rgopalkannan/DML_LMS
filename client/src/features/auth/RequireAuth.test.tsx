import { screen } from '@testing-library/react';
import { authState, learner, renderRoutes } from '@/test/render';
import { RequireAuth } from './RequireAuth';

const routes = [
  { path: '/login', element: <p>Login page</p> },
  { element: <RequireAuth roles={['ADMIN']} />, children: [{ path: '/admin', element: <p>Admin page</p> }] }
];

describe('RequireAuth', () => {
  it('redirects a signed-out visitor to sign in', () => {
    renderRoutes(routes, '/admin', authState({ user: null }));
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('blocks a role that is not allowed', () => {
    renderRoutes(routes, '/admin');
    expect(screen.getByText('You do not have access to this page')).toBeInTheDocument();
  });

  it('lets an allowed role through', () => {
    renderRoutes(routes, '/admin', authState({ user: { ...learner, role: 'ADMIN' } }));
    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });
});
