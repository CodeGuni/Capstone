import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [AuthModule, FilesModule, JobsModule, SearchModule],
})
export class AppModule {}
