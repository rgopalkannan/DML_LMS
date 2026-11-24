import { useState, type ReactElement } from 'react';
import { RouterProvider } from 'react-router';
import { createRouter } from '@/routes/router';
import { AppProviders } from './AppProviders';

export function App(): ReactElement {
  const [router] = useState(createRouter);
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
