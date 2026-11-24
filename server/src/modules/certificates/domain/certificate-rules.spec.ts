import { certificateExpiry, isCertificateValid, newCertificateSerial } from './certificate-rules';

describe('certificate rules', () => {
  const issued = new Date('2026-01-31T10:00:00Z');

  it('adds the validity months', () => {
    expect(certificateExpiry(new Date('2026-03-15T00:00:00Z'), 12)?.toISOString()).toBe('2027-03-15T00:00:00.000Z');
  });

  it('never expires when validity is 0', () => {
    expect(certificateExpiry(issued, 0)).toBeNull();
    expect(isCertificateValid(null, new Date('2100-01-01'))).toBe(true);
  });

  it('is invalid from the expiry moment on', () => {
    const expiry = new Date('2027-01-01T00:00:00Z');
    expect(isCertificateValid(expiry, new Date('2026-12-31T23:59:59Z'))).toBe(true);
    expect(isCertificateValid(expiry, expiry)).toBe(false);
  });

  it('builds a serial from the year and random bytes', () => {
    expect(newCertificateSerial(issued, Buffer.from([0xab, 0x01, 0, 0, 0, 0xff]))).toBe('DML-2026-AB01000000FF');
  });
});
