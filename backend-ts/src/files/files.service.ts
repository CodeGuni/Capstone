import { Injectable } from '@nestjs/common';
import { presignUpload } from './azure';

@Injectable()
export class FilesService {
  async presign(filename: string, contentType: string) {
    return presignUpload(filename, contentType);
  }
}
