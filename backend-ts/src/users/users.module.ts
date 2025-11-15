import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JobsModule } from "../jobs/jobs.module";

@Module({ 
  imports: [JobsModule],
  providers: [UsersService], 
  exports: [UsersService] 
})
export class UsersModule {}
