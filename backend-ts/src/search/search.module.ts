import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
<<<<<<< HEAD
  exports: [SearchService], // ✅ Exported so it can be used elsewhere if needed
=======
>>>>>>> origin/main
})
export class SearchModule {}
