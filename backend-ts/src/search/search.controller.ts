import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiBody } from '@nestjs/swagger';
import { recSearchImage } from './rec.client';

class SearchImageDto {
  @ApiProperty() imageKey!: string;
  @ApiProperty({ required: false, default: 10 }) topK?: number;
}

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  @Post('image')
  @ApiBody({ type: SearchImageDto })
  async image(@Body() dto: SearchImageDto) {
    if (!dto?.imageKey) throw new Error('imageKey required');
    const base = process.env.REC_SVC_URL ?? 'http://localhost:8001';
    return recSearchImage(base, { imageKey: dto.imageKey, topK: dto.topK ?? 10 });
  }
}
