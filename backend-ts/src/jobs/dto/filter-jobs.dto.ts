import { JobStatus, JobType } from '@prisma/client';

export class FilterJobsDto {
  status?: JobStatus;
  type?: JobType;
  page?: number;
  limit?: number;
}

