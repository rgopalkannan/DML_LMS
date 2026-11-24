import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from '../../common/decorators/auth.decorators';
import { type AuthUser } from '../../common/types/auth-user';
import { AuthService } from './auth.service';
import { LoginRequestDto, type LoginResponseDto } from './dto/auth.dto';

const LOGIN_ATTEMPTS_PER_MINUTE = 10;
const ONE_MINUTE_MS = 60_000;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: LOGIN_ATTEMPTS_PER_MINUTE, ttl: ONE_MINUTE_MS } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
