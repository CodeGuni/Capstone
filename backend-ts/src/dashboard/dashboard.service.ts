import { Injectable, Inject } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(JobsService) private readonly jobsService: JobsService,
  ) {}

  async getSummary(userId?: string) {
    try {
      const [totalJobs, totalOutfitJobs, totalVtoJobs, jobsThisMonth, recentJobs] =
        await Promise.all([
          this.jobsService.countAllJobsForUser(userId),
          this.jobsService.countJobsByTypeForUser(userId, JobType.OUTFIT),
          this.jobsService.countJobsByTypeForUser(userId, JobType.VTO),
          this.jobsService.countJobsThisMonth(userId),
          this.jobsService.findRecentJobs(userId, 10),
        ]);

      return {
        totalJobs,
        totalOutfitJobs,
        totalVtoJobs,
        jobsThisMonth,
        recentJobs,
      };
    } catch (e: any) {
      console.error('[DashboardService.getSummary] ERROR:', e?.message, e?.stack);
      throw e;
    }
  }
}

