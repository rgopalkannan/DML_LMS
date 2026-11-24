import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { type Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { ERROR_CODES, type ErrorCode } from '../constants/error-codes';
import { DomainError, type DomainErrorKind } from '../errors/domain-error';

export interface ErrorBody {
  error: { code: ErrorCode; message: string; details?: string[] };
}

const KIND_STATUS: Record<DomainErrorKind, HttpStatus> = {
  validation: HttpStatus.BAD_REQUEST,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  forbidden: HttpStatus.FORBIDDEN,
  unauthenticated: HttpStatus.UNAUTHORIZED
};

const STATUS_CODE: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.CONFLICT
};

/** Turns every thrown error into one response shape and never leaks stack traces or internal messages. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toResponse(exception);
    response.status(status).json(body);
  }

  toResponse(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof DomainError) {
      return {
        status: KIND_STATUS[exception.kind],
        body: { error: { code: exception.code, message: exception.message } }
      };
    }
    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        body: { error: { code: ERROR_CODES.RATE_LIMITED, message: 'Too many requests. Try again shortly.' } }
      };
    }
    if (exception instanceof HttpException) return this.fromHttpException(exception);
    this.logger.error({
      message: 'Unhandled error',
      name: exception instanceof Error ? exception.name : typeof exception,
      stack: exception instanceof Error ? exception.stack : undefined
    });
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: ERROR_CODES.INTERNAL, message: 'Something went wrong. Please try again.' } }
    };
  }

  private fromHttpException(exception: HttpException): { status: number; body: ErrorBody } {
    const status = exception.getStatus();
    const payload = exception.getResponse();
    const details =
      typeof payload === 'object' && payload !== null && Array.isArray((payload as { message?: unknown }).message)
        ? ((payload as { message: unknown[] }).message.filter(item => typeof item === 'string') as string[])
        : undefined;
    const code = STATUS_CODE[status] ?? ERROR_CODES.INTERNAL;
    const message = details
      ? 'Some fields are not valid.'
      : status >= 500
        ? 'Something went wrong. Please try again.'
        : exception.message;
    return { status, body: { error: details ? { code, message, details } : { code, message } } };
  }
}
