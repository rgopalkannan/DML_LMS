import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { toApiError } from '@/api/api-error';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';
import { useDownloadCertificate, useMyCertificates } from './certificate-queries';

export function CertificatesPage(): ReactElement {
  useDocumentTitle('Certificates');
  const query = useMyCertificates();
  const download = useDownloadCertificate();
  const now = Date.now();

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Certificates you have earned. Each one has an ID that anyone can verify."
      />
      {download.isError && (
        <div className="mb-4">
          <Alert tone="danger">{toApiError(download.error).message}</Alert>
        </div>
      )}
      <QueryState query={query}>
        {certificates =>
          certificates.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map(certificate => {
                const expired = certificate.expiresAt !== null && new Date(certificate.expiresAt).getTime() <= now;
                return (
                  <Card key={certificate.id} className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-brand">{certificate.courseCode}</p>
                        <p className="font-bold">{certificate.courseTitle}</p>
                      </div>
                      <Badge tone={expired ? 'danger' : 'success'}>{expired ? 'Expired' : 'Valid'}</Badge>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-ink-muted">Score</dt>
                      <dd>{certificate.scorePercent}%</dd>
                      <dt className="text-ink-muted">Issued</dt>
                      <dd>{formatDate(certificate.issuedAt)}</dd>
                      <dt className="text-ink-muted">Valid until</dt>
                      <dd>{certificate.expiresAt ? formatDate(certificate.expiresAt) : 'Does not expire'}</dd>
                      <dt className="text-ink-muted">Certificate ID</dt>
                      <dd className="font-mono text-xs">{certificate.serial}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        loading={download.isPending && download.variables.id === certificate.id}
                        onClick={() => download.mutate(certificate)}
                      >
                        Download PDF
                      </Button>
                      <Button asChild size="sm" variant="secondary">
                        <Link to={ROUTES.verify(certificate.serial)}>Verification page</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No certificates yet" description="Pass a course's final quiz to earn its certificate." />
          )
        }
      </QueryState>
    </>
  );
}
