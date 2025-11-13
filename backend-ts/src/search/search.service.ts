import { BadGatewayException, Injectable } from "@nestjs/common";

type RecSvcResult = {
  results: Array<{ id: string; score: number; [k: string]: any }>;
};

@Injectable()
export class SearchService {
  private recUrl = process.env.REC_SVC_URL || "http://localhost:8001";
  private timeoutMs = +(process.env.REC_SVC_TIMEOUT_MS || 8000);
  private allowMock = process.env.SEARCH_ALLOW_MOCK === "1";

  // ✅ MOCK for UI demo mode
  mock(topK = 10): RecSvcResult {
    return {
      results: Array.from({ length: topK }).map((_, i) => ({
        id: `mock-${i + 1}`,
        score: +(1 - i * 0.05).toFixed(2),
        title: `Mock result #${i + 1}`,
        image: `https://picsum.photos/seed/${i + 1}/256/256`,
      })),
    };
  }

  private async call(endpoint: string, payload: object): Promise<RecSvcResult> {
    if (this.allowMock) return this.mock(payload["topK"] ?? 10);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.recUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new BadGatewayException({
          statusCode: res.status,
          message: json?.message || res.statusText || "rec-svc error",
        });
      }

      return json as RecSvcResult;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new BadGatewayException({
          statusCode: 500,
          message: `rec-svc timeout after ${this.timeoutMs}ms`,
        });
      }
      throw new BadGatewayException({
        statusCode: 500,
        message: err?.message || "rec-svc unreachable",
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async imageSearch(imageUrl: string, topK = 10) {
    return this.call("/search/image", { imageUrl, topK });
  }

  async textSearch(text: string, topK = 10) {
    return this.call("/search/text", { text, topK });
  }

  async hybridSearch(text: string | null, imageUrl: string | null, alpha = 0.5, topK = 10) {
    return this.call("/search/hybrid", { text, imageUrl, alpha, topK });
  }
}
