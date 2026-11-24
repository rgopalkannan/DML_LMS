import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

/** Purposes keep a token issued for one job from being accepted for another. */
export type TokenPurpose = 'access' | 'quiz-draw';

export interface ITokenService {
  sign(
    purpose: TokenPurpose,
    subject: string,
    claims: Record<string, unknown>,
    expiresInSeconds?: number
  ): Promise<string>;
  /** Returns the claims, or null when the token is invalid, expired or for another purpose. */
  verify(purpose: TokenPurpose, token: string): Promise<(Record<string, unknown> & { sub: string }) | null>;
}

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(
    purpose: TokenPurpose,
    subject: string,
    claims: Record<string, unknown>,
    expiresInSeconds?: number
  ): Promise<string> {
    const options = expiresInSeconds
      ? { audience: purpose, subject, expiresIn: expiresInSeconds }
      : { audience: purpose, subject };
    return this.jwt.signAsync(claims, options);
  }

  async verify(purpose: TokenPurpose, token: string): Promise<(Record<string, unknown> & { sub: string }) | null> {
    try {
      const payload = await this.jwt.verifyAsync<Record<string, unknown>>(token, { audience: purpose });
      return typeof payload.sub === 'string' ? { ...payload, sub: payload.sub } : null;
    } catch {
      return null;
    }
  }
}
