import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { DomainError } from '../../common/errors/domain-error';
import { type AuthUser } from '../../common/types/auth-user';
import { APP_CONFIG, type AppConfig } from '../../config/app-config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private readonly auth: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
      audience: 'access'
    });
  }

  async validate(payload: { sub: string }): Promise<AuthUser> {
    const user = await this.auth.resolveUser(payload.sub);
    if (!user) throw new DomainError('unauthenticated', ERROR_CODES.UNAUTHENTICATED, 'Please sign in again.');
    return user;
  }
}
