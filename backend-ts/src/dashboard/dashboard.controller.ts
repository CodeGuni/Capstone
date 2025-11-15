import { Controller, Get, Request, UseGuards, InternalServerErrorException, Inject } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Request() req: any) {
    try {
      if (!this.dashboardService) {
        console.error('[dashboard/summary] DashboardService is undefined!');
        throw new InternalServerErrorException('DashboardService not initialized');
      }
      const userId = req.user?.userId;
      return await this.dashboardService.getSummary(userId);
    } catch (e: any) {
      console.error('[dashboard/summary] ERROR:', e?.message, e?.stack);
      throw new InternalServerErrorException(e?.message || 'Failed to get dashboard summary');
    }
  }
}

