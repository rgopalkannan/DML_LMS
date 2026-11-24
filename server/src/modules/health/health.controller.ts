import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Public } from '../../common/decorators/auth.decorators';
import { HEALTH_PROBE, type IHealthProbe } from '../../database/interfaces/health-probe';

export interface HealthResponseDto {
  status: 'ok';
  database: 'up';
}

/** Liveness and readiness for the container platform. */
@Controller('health')
export class HealthController {
  constructor(@Inject(HEALTH_PROBE) private readonly probe: IHealthProbe) {}

  @Public()
  @Get()
  async check(): Promise<HealthResponseDto> {
    if (!(await this.probe.databaseReachable()))
      throw new HttpException('Database unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    return { status: 'ok', database: 'up' };
  }
}
