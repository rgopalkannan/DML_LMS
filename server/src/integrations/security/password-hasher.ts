import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LIMITS } from '../../common/constants/domain';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

/** bcrypt adapter. */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, LIMITS.BCRYPT_ROUNDS);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
