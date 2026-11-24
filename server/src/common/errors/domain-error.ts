import { type ErrorCode } from '../constants/error-codes';

/** Kinds map to HTTP statuses in the exception filter, so services stay free of HTTP details. */
export type DomainErrorKind = 'validation' | 'not_found' | 'conflict' | 'forbidden' | 'unauthenticated';

export class DomainError extends Error {
  constructor(
    readonly kind: DomainErrorKind,
    readonly code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
