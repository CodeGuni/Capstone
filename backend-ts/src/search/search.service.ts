import { BadGatewayException, Injectable } from "@nestjs/common";

type RecSvcResult = {
  results: Array<{ id: string; score: number; [k: string]: any }>;
};

@Injectable()
export class SearchService {
  private recUrl = process.env.REC_SVC_URL || "http://localhost:8001";
  private timeoutMs = +(process.env.REC_SVC_TIMEOUT_MS || 8000);

<<<<<<< HEAD
  // -------------------------------------------------------------------
  // INTERNAL HTTP CALL WITH TIMEOUT + REQUIRED ERROR FORMAT
  // -------------------------------------------------------------------
  private async call(endpoint: string, payload: object): Promise<RecSvcResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.recUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let json: any;
      try {
        json = await res.json();
      } catch (_) {
        json = null;
      }

      // ✅ Required error response shape
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

  // -------------------------------------------------------------------
  // PUBLIC API METHODS — USED BY CONTROLLERS
  // -------------------------------------------------------------------

  /**
   * IMAGE SEARCH (CLIP image → KNN nearest images)
   * Calls: POST /search/image
   */
  async imageSearch(imageUrl: string, topK = 10): Promise<RecSvcResult> {
    return this.call("/search/image", { imageUrl, topK });
  }

  /**
   * TEXT SEARCH (CLIP text → KNN nearest images)
   * Calls: POST /search/text
   */
  async textSearch(text: string, topK = 10): Promise<RecSvcResult> {
    return this.call("/search/text", { text, topK });
  }

  /**
   * HYBRID SEARCH (blend text + image embedding scores)
   * Calls: POST /search/hybrid
   */
  async hybridSearch(
    text: string | null,
    imageUrl: string | null,
    alpha = 0.5,
    topK = 10
  ): Promise<RecSvcResult> {
    return this.call("/search/hybrid", { text, imageUrl, alpha, topK });
  }
=======
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

  async imageSearch(imageUrl: string, topK = 10): Promise<RecSvcResult> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.recUrl}/search/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, topK }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new BadGatewayException(
          `rec-svc ${res.status}: ${text || res.statusText}`
        );
      }
      return (await res.json()) as RecSvcResult;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new BadGatewayException(
          `rec-svc timeout after ${this.timeoutMs}ms`
        );
      }
      throw new BadGatewayException(
        `rec-svc unreachable (${this.recUrl}/search/image): ${
          err?.message || err
        }`
      );
    } finally {
      clearTimeout(t);
    }
  }
>>>>>>> 91a16942160d47dfadf241795dde0cff6593b312
}
