import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type Page, type UserChanges } from '../../database/interfaces/user.repository';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type User } from '../../domain/entities';
import { type IPasswordHasher, PASSWORD_HASHER } from '../../integrations/security/password-hasher';
import { type CreateUserRequestDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher
  ) {}

  list(query: { page: number; pageSize: number; search?: string }): Promise<Page<User>> {
    return this.uow.users.list(query);
  }

  async create(actor: AuthUser, input: CreateUserRequestDto): Promise<User> {
    const passwordHash = await this.hasher.hash(input.password);
    return this.uow.transaction(async uow => {
      if (await uow.users.existsByEmail(input.email)) {
        throw new DomainError('conflict', ERROR_CODES.EMAIL_TAKEN, 'A user with this email already exists.');
      }
      const user = await uow.users.create({ email: input.email, name: input.name, role: input.role, passwordHash });
      await uow.audit.record({ actorId: actor.id, action: 'user.create', entity: 'user', entityId: user.id });
      return user;
    });
  }

  async update(actor: AuthUser, userId: string, changes: UserChanges): Promise<User> {
    if (actor.id === userId && (changes.isActive === false || (changes.role && changes.role !== actor.role))) {
      throw new DomainError(
        'validation',
        ERROR_CODES.FORBIDDEN,
        'You cannot deactivate yourself or change your own role.'
      );
    }
    return this.uow.transaction(async uow => {
      if (!(await uow.users.findById(userId))) {
        throw new DomainError('not_found', ERROR_CODES.NOT_FOUND, 'User not found.');
      }
      const user = await uow.users.update(userId, changes);
      await uow.audit.record({ actorId: actor.id, action: 'user.update', entity: 'user', entityId: userId });
      return user;
    });
  }
}
