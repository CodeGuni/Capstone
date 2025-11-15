import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JobsService } from "../jobs/jobs.service";
import { AdminUserResponseDto } from "./dto/admin-user-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JobsService) private readonly jobsService: JobsService,
  ) {}
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async countAllUsers(): Promise<number> {
    try {
      const count = await this.prisma.user.count();
      console.log('[UsersService.countAllUsers] Count:', count);
      return count;
    } catch (e: any) {
      console.error('[UsersService.countAllUsers] ERROR:', e?.message);
      console.error('[UsersService.countAllUsers] Stack:', e?.stack);
      return 0;
    }
  }

  async findUsersWithStats(params: {
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ users: AdminUserResponseDto[]; total: number }> {
    try {
      const where: any = {};
      if (params.search) {
        where.email = {
          contains: params.search,
          mode: 'insensitive',
        };
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip: params.skip ?? 0,
          take: params.take ?? 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const [totalJobs, latestJob] = await Promise.all([
            this.jobsService.countJobsByUser(user.id),
            this.jobsService.findLatestJobForUser(user.id),
          ]);

          return {
            ...user,
            stats: {
              totalJobs,
              lastJobDate: latestJob?.createdAt ?? null,
            },
          };
        })
      );

      return {
        users: usersWithStats,
        total,
      };
    } catch (e: any) {
      console.error('[UsersService.findUsersWithStats] ERROR:', e?.message);
      throw e;
    }
  }

  async findUserWithStatsById(id: string): Promise<AdminUserResponseDto | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return null;
      }

      const [totalJobs, latestJob] = await Promise.all([
        this.jobsService.countJobsByUser(user.id),
        this.jobsService.findLatestJobForUser(user.id),
      ]);

      return {
        ...user,
        stats: {
          totalJobs,
          lastJobDate: latestJob?.createdAt ?? null,
        },
      };
    } catch (e: any) {
      console.error('[UsersService.findUserWithStatsById] ERROR:', e?.message);
      throw e;
    }
  }
}
