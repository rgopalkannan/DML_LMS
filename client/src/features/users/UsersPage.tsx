import { useState, type ReactElement } from 'react';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TextField } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { LIMITS, ROLE_LABEL } from '@/constants/labels';
import { useAuth } from '@/features/auth/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { User } from '@/types/api';
import { CreateUserDialog } from './CreateUserDialog';
import { useUpdateUser, useUsers } from './user-queries';

export function UsersPage(): ReactElement {
  useDocumentTitle('Users');
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [deactivating, setDeactivating] = useState<User | null>(null);
  const query = useUsers(page, search.trim());
  const update = useUpdateUser();

  return (
    <>
      <PageHeader
        title="Users"
        description="Add people and control who can sign in."
        actions={<Button onClick={() => setAdding(true)}>Add user</Button>}
      />
      <div className="mb-4 max-w-sm">
        <TextField
          label="Search by name or email"
          type="search"
          value={search}
          onChange={event => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>
      {update.isError && (
        <div className="mb-4">
          <Alert tone="danger">{toApiError(update.error).message}</Alert>
        </div>
      )}
      <QueryState query={query}>
        {result => {
          if (!result.items.length) return <EmptyState title="No users found" />;
          const pages = Math.max(1, Math.ceil(result.total / LIMITS.USERS_PAGE_SIZE));
          return (
            <>
              <Card className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Users</caption>
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Role
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {result.items.map(user => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 font-semibold">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{ROLE_LABEL[user.role]}</td>
                        <td className="px-4 py-3">
                          <Badge tone={user.isActive ? 'success' : 'neutral'}>
                            {user.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.id !== me?.id && (
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={update.isPending && update.variables.userId === user.id}
                              onClick={() =>
                                user.isActive
                                  ? setDeactivating(user)
                                  : update.mutate({ userId: user.id, changes: { isActive: true } })
                              }
                            >
                              {user.isActive ? 'Deactivate' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
                <span>
                  {result.total} users · page {result.page} of {pages}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              </nav>
            </>
          );
        }}
      </QueryState>
      <CreateUserDialog open={adding} onOpenChange={setAdding} />
      <ConfirmDialog
        open={deactivating !== null}
        title={`Deactivate ${deactivating?.name ?? ''}?`}
        description="They will be signed out and cannot sign in until reactivated. Their records are kept."
        confirmLabel="Deactivate"
        onCancel={() => setDeactivating(null)}
        onConfirm={() => {
          if (deactivating) update.mutate({ userId: deactivating.id, changes: { isActive: false } });
          setDeactivating(null);
        }}
      />
    </>
  );
}
