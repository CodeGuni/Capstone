import { Controller, Post, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { createUploadSAS } from "./azure";

@ApiTags("files")
@ApiBearerAuth()
@Controller("files")
export class FilesController {
  @Post("presign")
  async presign(@Body() dto: { mime: string; bytes: number }) {
    if (dto.bytes > 10 * 1024 * 1024)
      throw new Error("File too large (10MB max)");
    const ext = dto.mime.split("/")[1] || "bin";
    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const sas = await createUploadSAS(key, dto.mime);
    return { key, ...sas };
  }
}
