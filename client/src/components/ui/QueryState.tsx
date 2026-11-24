import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { toApiError } from '@/api/api-error';
import { Alert } from './Alert';
import { Button } from './Button';
import { Spinner } from './Spinner';

/** Shows the loading and error states of a query, and renders children with the data once it arrives. */
export function QueryState<T>({
  query,
  children
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}): ReactElement {
  if (query.isPending) {
    return (
      <div className="flex justify-center py-16 text-brand">
        <Spinner />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="danger" title="This could not be loaded">
        <p>{toApiError(query.error).message}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </Alert>
    );
  }
  return <>{children(query.data)}</>;
}
