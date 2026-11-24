import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { createAppLogger } from './common/logger/app-logger';
import { APP_CONFIG, type AppConfig } from './config/app-config';

async function bootstrap(): Promise<void> {
  const logger = createAppLogger();
  const app = await NestFactory.create(AppModule, { logger });
  configureApp(app);
  const config = app.get<AppConfig>(APP_CONFIG);
  await app.listen(config.port);
  logger.log({ message: 'API listening', port: config.port, env: config.nodeEnv }, 'Bootstrap');
}

void bootstrap();
