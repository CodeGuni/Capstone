export class AdminUserResponseDto {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  stats: {
    totalJobs: number;
    lastJobDate: Date | null;
  };
}

