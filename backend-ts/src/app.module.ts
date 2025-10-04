import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { JobsModule } from './jobs/jobs.module';
@Module({ controllers: [HealthController] })
export class AppModule {}

