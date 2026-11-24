import { randomBytes } from 'node:crypto';
import { LIMITS } from '../../../common/constants/domain';

const SERIAL_BYTES = 6;

/** Expiry date for a certificate, or null when the course's certificates never expire (0 months). */
export function certificateExpiry(issuedAt: Date, validityMonths: number): Date | null {
  if (validityMonths <= 0) return null;
  const expiry = new Date(issuedAt.getTime());
  expiry.setUTCMonth(expiry.getUTCMonth() + validityMonths);
  return expiry;
}

export function isCertificateValid(expiresAt: Date | null, now: Date): boolean {
  return expiresAt === null || expiresAt.getTime() > now.getTime();
}

/** A short, unguessable serial such as DML-2026-9F3A61C0B2D4, printed on the certificate and used to verify it. */
export function newCertificateSerial(issuedAt: Date, bytes: Buffer = randomBytes(SERIAL_BYTES)): string {
  return `${LIMITS.CERTIFICATE_SERIAL_PREFIX}-${issuedAt.getUTCFullYear()}-${bytes.toString('hex').toUpperCase()}`;
}
