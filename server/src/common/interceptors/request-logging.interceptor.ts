import { type CallHandler, type ExecutionContext, Injectable, Logger, type NestInterceptor } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { type Observable, tap } from 'rxjs';
import { type AuthUser } from '../types/auth-user';

/** One structured line per request: method, route, status, duration and user id. Never bodies or tokens. */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: AuthUser }>();
    const started = Date.now();
    const log = (status: number): void =>
      this.logger.log({
        message: 'request',
        method: request.method,
        route: (request.route as { path?: string } | undefined)?.path ?? request.path,
        status,
        durationMs: Date.now() - started,
        userId: request.user?.id ?? null
      });
    return next.handle().pipe(
      tap({
        next: () => log(http.getResponse<Response>().statusCode),
        error: (error: unknown) => log((error as { getStatus?: () => number }).getStatus?.() ?? 500)
      })
    );
  }
}
