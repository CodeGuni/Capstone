import { Body, Controller, HttpCode, HttpStatus, Inject, Post, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(@Inject(FilesService) private readonly files: FilesService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async presign(@Body() body: { filename: string; contentType: string }) {
    console.log('[files/presign] body =', body);
    try {
      const res = await this.files.presign(body.filename, body.contentType);
      console.log('[files/presign] ok');
      return res;
    } catch (e: any) {
      console.error('AZURE PRESIGN ERROR:', e?.message);
      throw new BadRequestException(e?.message || 'presign failed');
    }
  }
}
