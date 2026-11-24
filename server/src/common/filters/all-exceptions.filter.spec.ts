import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { DomainError } from '../errors/domain-error';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('maps a domain error kind to its status and keeps its code', () => {
    const result = filter.toResponse(new DomainError('conflict', 'EMAIL_TAKEN', 'Email already used'));
    expect(result.status).toBe(409);
    expect(result.body.error).toEqual({ code: 'EMAIL_TAKEN', message: 'Email already used' });
  });

  it('lists validation details', () => {
    const result = filter.toResponse(new BadRequestException({ message: ['email must be an email'] }));
    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_FAILED');
    expect(result.body.error.details).toEqual(['email must be an email']);
  });

  it('maps Nest HTTP errors', () => {
    expect(filter.toResponse(new NotFoundException()).body.error.code).toBe('NOT_FOUND');
  });

  it('maps rate limiting to 429', () => {
    expect(filter.toResponse(new ThrottlerException()).status).toBe(429);
  });

  it('hides internal error messages', () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const result = filter.toResponse(new Error('db password is hunter2'));
    expect(result.status).toBe(500);
    expect(result.body.error.message).not.toContain('hunter2');
  });
});
