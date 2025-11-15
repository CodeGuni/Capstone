import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { PaypalService } from '../paypal/paypal.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(JobsService) private readonly jobsService: JobsService,
    @Inject(PaypalService) private readonly paypalService: PaypalService,
  ) {}

  @Get('ping')
  @Roles('admin')
  ping() {
    return { ok: true, who: 'admin' };
  }

  @Get('overview')
  @Roles('admin')
  async getOverview() {
    const [totalUsers, totalJobs, jobsToday, totalRevenue] = await Promise.all([
      this.usersService.countAllUsers(),
      this.jobsService.countAllJobs(),
      this.jobsService.countJobsToday(),
      this.paypalService.getTotalRevenue(),
    ]);

    return {
      totalUsers,
      totalJobs,
      jobsToday,
      totalRevenue,
    };
  }
}
