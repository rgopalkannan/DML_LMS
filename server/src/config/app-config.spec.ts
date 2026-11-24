import { loadAppConfig } from './app-config';

const base = {
  DATABASE_URL: 'postgresql://x',
  JWT_SECRET: 'a'.repeat(32)
};

describe('loadAppConfig', () => {
  it('applies defaults', () => {
    const config = loadAppConfig({ ...base });
    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.corsOrigins).toEqual([]);
  });

  it('rejects a short JWT secret', () => {
    expect(() => loadAppConfig({ ...base, JWT_SECRET: 'short' })).toThrow(/at least 32/);
  });

  it('rejects a missing database URL', () => {
    expect(() => loadAppConfig({ JWT_SECRET: base.JWT_SECRET })).toThrow(/DATABASE_URL/);
  });

  it('requires CORS origins in production', () => {
    expect(() => loadAppConfig({ ...base, NODE_ENV: 'production' })).toThrow(/CORS_ORIGINS/);
  });

  it('parses a comma-separated origin list', () => {
    const config = loadAppConfig({ ...base, CORS_ORIGINS: 'https://a.example, https://b.example' });
    expect(config.corsOrigins).toEqual(['https://a.example', 'https://b.example']);
  });

  it('rejects a non-numeric port', () => {
    expect(() => loadAppConfig({ ...base, PORT: 'abc' })).toThrow(/PORT/);
  });
});
