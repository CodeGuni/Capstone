import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { recSearchImage } from "./rec.client";

@ApiTags("search")
@ApiBearerAuth()
@Controller("search")
export class SearchController {
  @Post("image")
  async byImage(@Body() dto: { imageKey: string; topK?: number }) {
    if (!dto.imageKey) throw new Error("imageKey required");
    const base = process.env.REC_SVC_URL ?? "http://localhost:8001";
    return recSearchImage(base, {
      imageKey: dto.imageKey,
      topK: dto.topK ?? 10,
    });
  }
}
