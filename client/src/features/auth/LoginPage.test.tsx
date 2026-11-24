import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/api/api-error';
import { authState, renderRoutes } from '@/test/render';
import { LoginPage } from './LoginPage';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <p>Home page</p> }
];

describe('LoginPage', () => {
  it('shows field errors and does not call the API for empty input', async () => {
    const auth = authState({ user: null });
    renderRoutes(routes, '/login', auth);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('shows the server message when sign-in fails', async () => {
    const auth = authState({
      user: null,
      signIn: vi.fn().mockRejectedValue(new ApiError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401))
    });
    renderRoutes(routes, '/login', auth);
    await userEvent.type(screen.getByLabelText(/Email/), 'a@example.com');
    await userEvent.type(screen.getByLabelText(/Password/), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
    expect(auth.signIn).toHaveBeenCalledWith('a@example.com', 'wrong-password');
  });

  it('sends a signed-in user home', () => {
    renderRoutes(routes, '/login');
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
