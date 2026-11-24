import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@/api/api-error';
import { QueryState } from './QueryState';

const asQuery = (partial: Partial<UseQueryResult<string>>): UseQueryResult<string> => partial as UseQueryResult<string>;

describe('QueryState', () => {
  it('shows a loading indicator', () => {
    render(<QueryState query={asQuery({ isPending: true })}>{data => data}</QueryState>);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('shows the error and retries on request', async () => {
    const refetch = vi.fn();
    render(
      <QueryState
        query={asQuery({
          isPending: false,
          isError: true,
          error: new ApiError('NETWORK', 'Cannot reach the server.', null),
          refetch
        })}
      >
        {data => data}
      </QueryState>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot reach the server.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the data', () => {
    render(
      <QueryState query={asQuery({ isPending: false, isError: false, data: 'Loaded value' })}>
        {data => <p>{data}</p>}
      </QueryState>
    );
    expect(screen.getByText('Loaded value')).toBeInTheDocument();
  });
});
