import { type AuditEntry, type IAuditRepository } from '../interfaces/audit.repository';
import { type Db } from './prisma-types';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly db: Db) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.db.auditEvent.create({ data: entry });
  }
}
