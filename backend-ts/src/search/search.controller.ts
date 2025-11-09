import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Body,
  Query,
} from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(@Inject(SearchService) private readonly search: SearchService) {}

  @Post("image")
  @HttpCode(HttpStatus.OK)
  async byImage(
    @Body() body: { imageUrl?: string; topK?: number },
    @Query("mock") mock?: string
  ) {
    console.log("[search/image] body =", body, "mock =", mock);

    // mock=1 or env says so
    const allowMock = process.env.SEARCH_ALLOW_MOCK === "1";
    const useMock = mock === "1" || allowMock;
    const topK = Number(body?.topK ?? 10);
    if (Number.isNaN(topK) || topK <= 0) {
      throw new BadRequestException("topK must be a positive number");
    }
    if (useMock) {
      console.log("[search/image] returning MOCK results");
      return this.search.mock(topK);
    }

    const imageUrl = body?.imageUrl;
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new BadRequestException("imageUrl (string) is required");
    }

    // Real call-through
    return this.search.imageSearch(imageUrl, topK);
  }
}