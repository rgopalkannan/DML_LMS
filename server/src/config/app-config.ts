/* Reads and checks the environment once at start-up. Secrets come only from the environment. */
export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  rateLimitPerMinute: number;
  /** Public web address of the app, printed on certificates for verification. */
  publicAppUrl: string;
  /** Reverse proxies in front of the API (nginx in Docker), so rate limits see the real client address. */
  trustProxyHops: number;
}

export const APP_CONFIG = Symbol('APP_CONFIG');
const MIN_SECRET_LENGTH = 32;
const NODE_ENVS: ReadonlyArray<AppConfig['nodeEnv']> = ['development', 'test', 'production'];

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value) throw new Error(`Missing required environment variable ${key}`);
  return value;
}

function positiveInt(raw: string | undefined, fallback: number, key: string): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} must be a positive whole number`);
  return value;
}

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = (env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'];
  if (!NODE_ENVS.includes(nodeEnv)) throw new Error(`NODE_ENV must be one of ${NODE_ENVS.join(', ')}`);
  const jwtSecret = required(env, 'JWT_SECRET');
  if (jwtSecret.length < MIN_SECRET_LENGTH)
    throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`);
  const corsOrigins = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  if (nodeEnv === 'production' && corsOrigins.length === 0) throw new Error('CORS_ORIGINS is required in production');
  return {
    nodeEnv,
    port: positiveInt(env.PORT, 3000, 'PORT'),
    databaseUrl: required(env, 'DATABASE_URL'),
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '1h',
    corsOrigins,
    rateLimitPerMinute: positiveInt(env.RATE_LIMIT_PER_MINUTE, 120, 'RATE_LIMIT_PER_MINUTE'),
    trustProxyHops: env.TRUST_PROXY_HOPS ? positiveInt(env.TRUST_PROXY_HOPS, 1, 'TRUST_PROXY_HOPS') : 0,
    publicAppUrl: (env.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '')
  };
}
