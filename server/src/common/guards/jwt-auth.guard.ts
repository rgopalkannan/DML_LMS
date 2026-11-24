import { type ExecutionContext, Injectable } from '@nestjs/common';
import { type Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES } from '../constants/error-codes';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import { DomainError } from '../errors/domain-error';

/** Global guard: every route needs a valid access token unless marked @Public(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    return isPublic ? true : super.canActivate(context);
  }

  override handleRequest<TUser>(error: unknown, user: TUser | false): TUser {
    if (error instanceof DomainError) throw error;
    if (error || !user) throw new DomainError('unauthenticated', ERROR_CODES.UNAUTHENTICATED, 'Please sign in.');
    return user;
  }
}
