import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Role } from '../constants/domain';
import { ERROR_CODES } from '../constants/error-codes';
import { ROLES_KEY } from '../decorators/auth.decorators';
import { DomainError } from '../errors/domain-error';
import { type AuthUser } from '../types/auth-user';

/** Global guard: enforces @Roles(...) on the server; hiding a button in the UI is never the only check. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!roles || roles.length === 0) return true;
    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (user && roles.includes(user.role)) return true;
    throw new DomainError('forbidden', ERROR_CODES.FORBIDDEN, 'You do not have permission to do this.');
  }
}
