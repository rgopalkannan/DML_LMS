import { type Certificate, type CertificateView } from '../../domain/entities';

export interface NewCertificate {
  enrollmentId: string;
  serial: string;
  scorePercent: number;
  issuedAt: Date;
  expiresAt: Date | null;
}

export interface ICertificateRepository {
  findByEnrollment(enrollmentId: string): Promise<Certificate | null>;
  create(certificate: NewCertificate): Promise<Certificate>;
  listViewsForUser(userId: string): Promise<CertificateView[]>;
  findViewBySerial(serial: string): Promise<CertificateView | null>;
  findViewById(id: string): Promise<(CertificateView & { userId: string }) | null>;
}
