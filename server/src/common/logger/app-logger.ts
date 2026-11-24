import { ConsoleLogger, type LogLevel } from '@nestjs/common';

const LEVELS: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];

/**
 * The one logger for the application: structured JSON lines with a context field.
 * Never pass passwords, tokens or personal data in a log message or its context.
 */
export function createAppLogger(level: string | undefined = process.env.LOG_LEVEL): ConsoleLogger {
  const index = LEVELS.indexOf((level ?? 'log') as LogLevel);
  const enabled = LEVELS.slice(0, index === -1 ? LEVELS.indexOf('log') + 1 : index + 1);
  return new ConsoleLogger({ json: true, logLevels: enabled, colors: false });
}
