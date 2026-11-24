import { Injectable } from '@nestjs/common';
import { type IHealthProbe } from '../interfaces/health-probe';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaHealthProbe implements IHealthProbe {
  constructor(private readonly prisma: PrismaService) {}

  async databaseReachable(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
