import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { AdminController } from "./auth/admin.controller";
import { PrismaService } from "./prisma/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { JobsModule } from "./jobs/jobs.module";
import { FilesModule } from "./files/files.module";
import { SearchModule } from "./search/search.module";

@Module({
  imports: [AuthModule, UsersModule, JobsModule, FilesModule, SearchModule],
  controllers: [HealthController, AdminController],
  providers: [PrismaService],
})
export class AppModule {}
