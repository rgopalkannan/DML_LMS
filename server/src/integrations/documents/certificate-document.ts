export const CERTIFICATE_DOCUMENT = Symbol('CERTIFICATE_DOCUMENT');

/** What a certificate prints. Kept free of database and framework types. */
export interface CertificateDocumentData {
  serial: string;
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string | null;
  scorePercent: number;
  issuedAt: Date;
  expiresAt: Date | null;
  verifyUrl: string;
}

export interface ICertificateDocument {
  /** Renders the certificate as a PDF file. */
  render(data: CertificateDocumentData): Promise<Buffer>;
}
