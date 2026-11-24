import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type Certificate, type CertificateView, type Enrollment } from '../../domain/entities';
import { CERTIFICATE_DOCUMENT, type ICertificateDocument } from '../../integrations/documents/certificate-document';
import { isStaff } from '../courses/domain/course-rules';
import { certificateExpiry, isCertificateValid, newCertificateSerial } from './domain/certificate-rules';

export interface CertificateVerification {
  valid: boolean;
  certificate: CertificateView | null;
}

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(CERTIFICATE_DOCUMENT) private readonly document: ICertificateDocument
  ) {}

  /** Issues the certificate inside the caller's transaction; a second call for the same enrollment returns the first certificate. */
  async issue(
    uow: IUnitOfWork,
    enrollment: Enrollment,
    scorePercent: number,
    validityMonths: number,
    now: Date
  ): Promise<Certificate> {
    const existing = await uow.certificates.findByEnrollment(enrollment.id);
    if (existing) return existing;
    const certificate = await uow.certificates.create({
      enrollmentId: enrollment.id,
      serial: newCertificateSerial(now),
      scorePercent,
      issuedAt: now,
      expiresAt: certificateExpiry(now, validityMonths)
    });
    await uow.audit.record({
      actorId: enrollment.userId,
      action: 'certificate.issue',
      entity: 'certificate',
      entityId: certificate.id
    });
    return certificate;
  }

  listMine(user: AuthUser): Promise<CertificateView[]> {
    return this.uow.certificates.listViewsForUser(user.id);
  }

  async renderPdf(
    viewer: AuthUser,
    certificateId: string,
    verifyBaseUrl: string
  ): Promise<{ filename: string; pdf: Buffer }> {
    const certificate = await this.uow.certificates.findViewById(certificateId);
    if (!certificate || (certificate.userId !== viewer.id && !isStaff(viewer.role))) {
      throw new DomainError('not_found', ERROR_CODES.NOT_FOUND, 'Certificate not found.');
    }
    const pdf = await this.document.render({ ...certificate, verifyUrl: `${verifyBaseUrl}/${certificate.serial}` });
    return { filename: `certificate-${certificate.serial}.pdf`, pdf };
  }

  async verify(serial: string, now: Date): Promise<CertificateVerification> {
    const certificate = await this.uow.certificates.findViewBySerial(serial);
    if (!certificate) return { valid: false, certificate: null };
    return { valid: isCertificateValid(certificate.expiresAt, now), certificate };
  }
}
