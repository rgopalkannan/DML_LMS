import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { QueryState } from '@/components/ui/QueryState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';
import { useVerification } from './certificate-queries';

/** Public page: anyone with a certificate ID can check that it is genuine and in date. */
export function VerifyPage(): ReactElement {
  useDocumentTitle('Verify a certificate');
  const { serial = '' } = useParams();
  const query = useVerification(serial);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg space-y-4 p-8">
        <div className="flex items-center gap-3">
          <img src="/dml-mark.png" alt="" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">Certificate check</h1>
        </div>
        <p className="font-mono text-sm text-ink-muted">{serial}</p>
        <QueryState query={query}>
          {({ valid, certificate }) =>
            !certificate ? (
              <Alert tone="danger" title="Not found">
                No certificate has this ID.
              </Alert>
            ) : (
              <>
                <Alert
                  tone={valid ? 'success' : 'warning'}
                  title={valid ? 'Genuine and in date' : 'Genuine but expired'}
                />
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-ink-muted">Awarded to</dt>
                  <dd className="font-semibold">{certificate.learnerName}</dd>
                  <dt className="text-ink-muted">Course</dt>
                  <dd>{`${certificate.courseCode}: ${certificate.courseTitle}`}</dd>
                  <dt className="text-ink-muted">Issued</dt>
                  <dd>{formatDate(certificate.issuedAt)}</dd>
                  <dt className="text-ink-muted">Valid until</dt>
                  <dd>{certificate.expiresAt ? formatDate(certificate.expiresAt) : 'Does not expire'}</dd>
                </dl>
              </>
            )
          }
        </QueryState>
      </Card>
    </main>
  );
}
