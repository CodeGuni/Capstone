import { Controller, Get, UseGuards, Inject, Query, Param, NotFoundException } from '@nestjs/common';
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

  @Get('users')
  @Roles('admin')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    const result = await this.usersService.findUsersWithStats({
      skip,
      take: limitNum,
      search,
    });

    return {
      users: result.users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    };
  }

  @Get('users/:id')
  @Roles('admin')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserWithStatsById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
