import { Controller, Post, Body, Get, Query, UseGuards, Inject, Req } from '@nestjs/common';
import { ApiTags, ApiProperty, ApiBody } from '@nestjs/swagger';
import { HelloQueue } from './bullmq.provider';
import { JobsService } from './jobs.service';
import { JobStatus, JobType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class HelloDto {
  @ApiProperty({ required: false, example: 'AIFS' }) name?: string;
}

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JobsService) private readonly jobsService: JobsService,
  ) {}

  @Post('hello')
  @ApiBody({ type: HelloDto })
  async hello(@Body() dto: HelloDto) {
    const job = await HelloQueue.add('hello', { name: dto.name ?? 'world' });
    return { enqueued: true, jobId: job.id };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getJobs(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    const userId = req.user?.sub; // userId from JWT token

    const jobs = await this.jobsService.findJobsWithFilters({
      status: status as JobStatus | undefined,
      type: type as JobType | undefined,
      skip,
      take: limitNum,
      userId, 
    });

    return {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
      },
    };
  }
}

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminJobsController {
  constructor(
    @Inject(JobsService) private readonly jobsService: JobsService,
  ) {}

  @Get()
  @Roles('admin')
  async getAdminJobs(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    const jobs = await this.jobsService.findJobsWithFilters({
      status: status as JobStatus | undefined,
      type: type as JobType | undefined,
      skip,
      take: limitNum,
      //  admin - shows all jobs
    });

    return {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
      },
    };
  }
}
