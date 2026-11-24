import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_CONFIG, type AppConfig } from '../../config/app-config';
import { BcryptPasswordHasher, PASSWORD_HASHER } from '../../integrations/security/password-hasher';
import { JwtTokenService, TOKEN_SERVICE } from '../../integrations/tokens/token-service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as `${number}h` }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService }
  ],
  exports: [PASSWORD_HASHER, TOKEN_SERVICE]
})
export class AuthModule {}
