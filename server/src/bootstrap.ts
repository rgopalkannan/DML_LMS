import { type INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { APP_CONFIG, type AppConfig } from './config/app-config';

export const API_PREFIX = 'api/v1';

/** Shared by main.ts and the integration tests, so tests run the same security and validation setup. */
export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfig>(APP_CONFIG);
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 600
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();
}
