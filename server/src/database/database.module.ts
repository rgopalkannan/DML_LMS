import { Global, Module } from '@nestjs/common';
import { HEALTH_PROBE } from './interfaces/health-probe';
import { UNIT_OF_WORK } from './interfaces/unit-of-work.interface';
import { PrismaHealthProbe } from './unit-of-work/prisma-health.probe';
import { PrismaService } from './unit-of-work/prisma.service';
import { PrismaUnitOfWork } from './unit-of-work/prisma-unit-of-work';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: HEALTH_PROBE, useClass: PrismaHealthProbe },
    {
      provide: UNIT_OF_WORK,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => new PrismaUnitOfWork(prisma, prisma)
    }
  ],
  exports: [UNIT_OF_WORK, HEALTH_PROBE]
})
export class DatabaseModule {}
