import { useState, type FormEvent, type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from './auth-context';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage(): ReactElement {
  useDocumentTitle('Sign in');
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home;
  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const errors = {
      ...(EMAIL_PATTERN.test(email.trim()) ? {} : { email: 'Enter a valid email address.' }),
      ...(password ? {} : { password: 'Enter your password.' })
    };
    setFieldError(errors);
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(toApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src="/dml-mark.png" alt="" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-ink-muted">Data Mine Labs AML/CFT training</p>
          </div>
        </div>
        <form className="space-y-4" noValidate onSubmit={event => void onSubmit(event)}>
          {formError && <Alert tone="danger">{formError}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            error={fieldError.email}
            onChange={event => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            error={fieldError.password}
            onChange={event => setPassword(event.target.value)}
          />
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
