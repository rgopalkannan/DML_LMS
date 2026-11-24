import { type Prisma } from '@prisma/client';
import { type Certificate, type CertificateView } from '../../domain/entities';
import { type ICertificateRepository, type NewCertificate } from '../interfaces/certificate.repository';
import { type Db } from './prisma-types';

const viewInclude = {
  enrollment: {
    select: {
      userId: true,
      user: { select: { name: true } },
      course: { select: { code: true, title: true, instructor: { select: { name: true } } } }
    }
  }
} satisfies Prisma.CertificateInclude;

type ViewRow = Prisma.CertificateGetPayload<{ include: typeof viewInclude }>;

const toCertificate = (row: Certificate): Certificate => ({
  id: row.id,
  enrollmentId: row.enrollmentId,
  serial: row.serial,
  scorePercent: row.scorePercent,
  issuedAt: row.issuedAt,
  expiresAt: row.expiresAt
});

const toView = (row: ViewRow): CertificateView & { userId: string } => ({
  ...toCertificate(row),
  userId: row.enrollment.userId,
  learnerName: row.enrollment.user.name,
  courseCode: row.enrollment.course.code,
  courseTitle: row.enrollment.course.title,
  instructorName: row.enrollment.course.instructor?.name ?? null
});

export class PrismaCertificateRepository implements ICertificateRepository {
  constructor(private readonly db: Db) {}

  async findByEnrollment(enrollmentId: string): Promise<Certificate | null> {
    const row = await this.db.certificate.findUnique({ where: { enrollmentId } });
    return row ? toCertificate(row) : null;
  }

  /** ON CONFLICT DO NOTHING on the enrollment, so two passing submits at once still leave one certificate. */
  async create(certificate: NewCertificate): Promise<Certificate> {
    await this.db.certificate.createMany({ data: [certificate], skipDuplicates: true });
    const row = await this.db.certificate.findUniqueOrThrow({ where: { enrollmentId: certificate.enrollmentId } });
    return toCertificate(row);
  }

  async listViewsForUser(userId: string): Promise<CertificateView[]> {
    const rows = await this.db.certificate.findMany({
      where: { enrollment: { userId } },
      include: viewInclude,
      orderBy: { issuedAt: 'desc' }
    });
    return rows.map(toView);
  }

  async findViewBySerial(serial: string): Promise<CertificateView | null> {
    const row = await this.db.certificate.findUnique({ where: { serial }, include: viewInclude });
    return row ? toView(row) : null;
  }

  async findViewById(id: string): Promise<(CertificateView & { userId: string }) | null> {
    const row = await this.db.certificate.findUnique({ where: { id }, include: viewInclude });
    return row ? toView(row) : null;
  }
}
