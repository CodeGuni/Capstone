<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { SearchModule } from './search/search.module';
import { PaypalModule } from './paypal/paypal.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthModule, FilesModule, JobsModule, SearchModule, PaypalModule],
  controllers: [HealthController],
})
export class AppModule {}
=======
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({ providers: [UsersService, PrismaService], exports: [UsersService] })
export class UsersModule {}
>>>>>>> 91a16942160d47dfadf241795dde0cff6593b312
