import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
<<<<<<< HEAD
    exports: [SearchService],
=======
>>>>>>> 91a16942160d47dfadf241795dde0cff6593b312
})
export class SearchModule {}
