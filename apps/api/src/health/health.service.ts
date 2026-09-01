import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async checkDatabase() {
    const users = await this.prisma.user.count();
    const profiles = await this.prisma.profile.count();
    const portfolios = await this.prisma.portfolio.count();

    return {
      status: 'ok',
      database: 'connected',
      data: {
        users,
        profiles,
        portfolios,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
