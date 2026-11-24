import { Inject, Injectable, Logger } from '@nestjs/common';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../database/interfaces/unit-of-work.interface';
import { type IPasswordHasher, PASSWORD_HASHER } from '../../integrations/security/password-hasher';
import { type ITokenService, TOKEN_SERVICE } from '../../integrations/tokens/token-service';
import { type LoginResponseDto } from './dto/auth.dto';
import { toUserResponse } from '../users/user.mapper';

const INVALID_LOGIN = 'Email or password is incorrect.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Compared against when the email is unknown, so both cases take about the same time. */
  private readonly dummyHash: Promise<string>;

  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService
  ) {
    this.dummyHash = hasher.hash('timing-equaliser-not-a-password');
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.uow.users.findByEmailWithCredentials(email);
    const matches = await this.hasher.verify(password, user?.passwordHash ?? (await this.dummyHash));
    if (!user || !matches || !user.isActive) {
      this.logger.warn({
        message: 'Login refused',
        reason: !user ? 'unknown_account' : !user.isActive ? 'inactive' : 'bad_password'
      });
      throw new DomainError('unauthenticated', ERROR_CODES.INVALID_CREDENTIALS, INVALID_LOGIN);
    }
    const accessToken = await this.tokens.sign('access', user.id, { role: user.role });
    await this.uow.audit.record({ actorId: user.id, action: 'auth.login', entity: 'user', entityId: user.id });
    return { accessToken, user: toUserResponse(user) };
  }

  /** Resolves a token to a live, active user; a deactivated account loses access at once. */
  async resolveUser(userId: string): Promise<AuthUser | null> {
    const user = await this.uow.users.findById(userId);
    if (!user || !user.isActive) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
