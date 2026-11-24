import { AxiosError, AxiosHeaders } from 'axios';
import { toApiError } from './api-error';

const response = (status: number, data: unknown) =>
  new AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() }
  });

describe('toApiError', () => {
  it('keeps the server code, message and details', () => {
    const error = toApiError(
      response(400, {
        error: { code: 'VALIDATION_FAILED', message: 'Some fields are not valid.', details: ['email must be an email'] }
      })
    );
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', status: 400, details: ['email must be an email'] });
  });

  it('treats an unknown code as internal', () => {
    expect(toApiError(response(500, { error: { code: 'WEIRD', message: 'x' } })).code).toBe('INTERNAL');
  });

  it('reports network failures and timeouts', () => {
    expect(toApiError(new AxiosError('down', 'ERR_NETWORK')).code).toBe('NETWORK');
    expect(toApiError(new AxiosError('slow', 'ECONNABORTED')).code).toBe('TIMEOUT');
  });
});
