import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Body,
  Query,
<<<<<<< HEAD
  Get,
=======
>>>>>>> origin/main
} from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(@Inject(SearchService) private readonly search: SearchService) {}

<<<<<<< HEAD
  /**
   * 🔹 POST /search/image
   * Perform image-based similarity search via the AI FastAPI service.
   */
=======
>>>>>>> origin/main
  @Post("image")
  @HttpCode(HttpStatus.OK)
  async byImage(
    @Body() body: { imageUrl?: string; topK?: number },
    @Query("mock") mock?: string
  ) {
    console.log("[search/image] body =", body, "mock =", mock);

<<<<<<< HEAD
    const allowMock = process.env.SEARCH_ALLOW_MOCK === "1";
    const useMock = mock === "1" || allowMock;

=======
    // mock=1 or env says so
    const allowMock = process.env.SEARCH_ALLOW_MOCK === "1";
    const useMock = mock === "1" || allowMock;
>>>>>>> origin/main
    const topK = Number(body?.topK ?? 10);
    if (Number.isNaN(topK) || topK <= 0) {
      throw new BadRequestException("topK must be a positive number");
    }
<<<<<<< HEAD

=======
>>>>>>> origin/main
    if (useMock) {
      console.log("[search/image] returning MOCK results");
      return this.search.mock(topK);
    }

    const imageUrl = body?.imageUrl;
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new BadRequestException("imageUrl (string) is required");
    }

<<<<<<< HEAD
    // 🔹 Real AI call to FastAPI
    return this.search.imageSearch(imageUrl, topK);
  }

  /**
   * 🔹 GET /search/recommend
   * Perform text-based search using rec_svc AI microservice.
   */
  @Get("recommend")
  async getRecommendations(
    @Query("q") q: string,
    @Query("k") k?: string,
    @Query("mock") mock?: string
  ) {
    console.log("[search/recommend] q =", q);

    if (!q || typeof q !== "string") {
      throw new BadRequestException("Query parameter 'q' is required");
    }

    const topK = Number(k ?? 5);
    const allowMock = process.env.SEARCH_ALLOW_MOCK === "1";
    const useMock = mock === "1" || allowMock;

    if (useMock) {
      console.log("[search/recommend] returning MOCK results");
      return this.search.mock(topK);
    }

    // 🔹 Real AI text-based retrieval
    return this.search.textSearch(q, topK);
  }
=======
    // Real call-through
    return this.search.imageSearch(imageUrl, topK);
  }
>>>>>>> origin/main
}
