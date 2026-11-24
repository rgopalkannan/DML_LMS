import { type User as UserRow } from '@prisma/client';
import { type User, type UserWithCredentials } from '../../domain/entities';
import { type IUserRepository, type NewUser, type Page, type UserChanges } from '../interfaces/user.repository';
import { type Db } from './prisma-types';

const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  isActive: row.isActive,
  createdAt: row.createdAt
});

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  }

  async findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? { ...toUser(row), passwordHash: row.passwordHash } : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.db.user.count({ where: { email } })) > 0;
  }

  async list(query: { page: number; pageSize: number; search?: string }): Promise<Page<User>> {
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } }
          ]
        }
      : {};
    const [rows, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.db.user.count({ where })
    ]);
    return { items: rows.map(toUser), total, page: query.page, pageSize: query.pageSize };
  }

  async create(user: NewUser): Promise<User> {
    return toUser(await this.db.user.create({ data: user }));
  }

  async update(id: string, changes: UserChanges): Promise<User> {
    return toUser(await this.db.user.update({ where: { id }, data: changes }));
  }
}
