export interface AuditEntry {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
}

export interface IAuditRepository {
  record(entry: AuditEntry): Promise<void>;
}
