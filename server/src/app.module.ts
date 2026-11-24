import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { ConfigModule } from './config/config.module';
import { APP_CONFIG, type AppConfig } from './config/app-config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { CoursesModule } from './modules/courses/courses.module';
import { HealthController } from './modules/health/health.controller';
import { LearningModule } from './modules/learning/learning.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { UsersModule } from './modules/users/users.module';

const ONE_MINUTE_MS = 60_000;

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => [{ name: 'default', ttl: ONE_MINUTE_MS, limit: config.rateLimitPerMinute }]
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    LearningModule,
    QuizzesModule,
    CertificatesModule
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor }
  ]
})
export class AppModule {}
