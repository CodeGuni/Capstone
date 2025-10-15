import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiProperty, ApiBody } from '@nestjs/swagger';
import { HelloQueue } from './bullmq.provider';

class HelloDto {
  @ApiProperty({ required: false, example: 'AIFS' }) name?: string;
}

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  @Post('hello')
  @ApiBody({ type: HelloDto })
  async hello(@Body() dto: HelloDto) {
    const job = await HelloQueue.add('hello', { name: dto.name ?? 'world' });
    return { enqueued: true, jobId: job.id };
  }
}
