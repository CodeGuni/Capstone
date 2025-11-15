import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobType, JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async countAllJobsForUser(userId?: string): Promise<number> {
    try {
      const where = userId ? { userId } : {};
      return await this.prisma.job.count({ where });
    } catch (e: any) {
      console.error('[JobsService.countAllJobsForUser] ERROR:', e?.message);
      // return 0 instead of crashing
      if (e?.message?.includes('job') || e?.message?.includes('model')) {
        console.warn('Job model may not exist in database yet. Run: npm run prisma:gen && npm run prisma:push');
        return 0;
      }
      throw e;
    }
  }

  async countJobsByTypeForUser(
    userId?: string,
    type?: JobType,
  ): Promise<number> {
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    return this.prisma.job.count({ where });
  }

  async countJobsThisMonth(userId?: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const where: any = {
      createdAt: {
        gte: startOfMonth,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    return this.prisma.job.count({ where });
  }

  async findRecentJobs(
    userId?: string,
    limit: number = 10,
  ): Promise<any[]> {
    const where = userId ? { userId } : {};
    return this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async countAllJobs(): Promise<number> {
    try {
      return await this.prisma.job.count();
    } catch (e: any) {
      console.error('[JobsService.countAllJobs] ERROR:', e?.message);
      return 0;
    }
  }

  async countJobsToday(): Promise<number> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return await this.prisma.job.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      });
    } catch (e: any) {
      console.error('[JobsService.countJobsToday] ERROR:', e?.message);
      return 0;
    }
  }

  async countJobsByUser(userId: string): Promise<number> {
    try {
      return await this.prisma.job.count({
        where: { userId },
      });
    } catch (e: any) {
      console.error('[JobsService.countJobsByUser] ERROR:', e?.message);
      return 0;
    }
  }

  async findLatestJobForUser(userId: string): Promise<{ createdAt: Date } | null> {
    try {
      const job = await this.prisma.job.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      return job;
    } catch (e: any) {
      console.error('[JobsService.findLatestJobForUser] ERROR:', e?.message);
      return null;
    }
  }

  async findJobsWithFilters(params: {
    status?: JobStatus;
    type?: JobType;
    skip?: number;
    take?: number;
    userId?: string;
  }): Promise<any[]> {
    try {
      const where: any = {};
      if (params.status) where.status = params.status;
      if (params.type) where.type = params.type;
      if (params.userId) where.userId = params.userId;

      return await this.prisma.job.findMany({
        where,
        skip: params.skip ?? 0,
        take: params.take ?? 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } catch (e: any) {
      console.error('[JobsService.findJobsWithFilters] ERROR:', e?.message);
      throw e;
    }
  }
}

