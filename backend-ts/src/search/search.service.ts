import { BadGatewayException, Injectable } from "@nestjs/common";

type RecSvcResult = {
  results: Array<{ id: string; score: number; [k: string]: any }>;
};

@Injectable()
export class SearchService {
  private recUrl = process.env.REC_SVC_URL || "http://localhost:8001";
  private timeoutMs = +(process.env.REC_SVC_TIMEOUT_MS || 8000);

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

  // ✅ IMAGE-ONLY SEARCH (/search/image)
  async imageSearch(imageUrl: string, topK = 10): Promise<RecSvcResult> {
    return this._callRecSvc("/search/image", { imageUrl, topK });
  }

  // ✅ HYBRID SEARCH (/search/hybrid)
  async hybridSearch(imageUrl: string, topK = 10): Promise<RecSvcResult> {
    return this._callRecSvc("/search/hybrid", { imageUrl, topK });
  }

  // 🔥 SHARED INTERNAL REQUEST HANDLER
  private async _callRecSvc(endpoint: string, payload: object): Promise<RecSvcResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.recUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new BadGatewayException(
          `rec-svc ${res.status} ${endpoint}: ${text || res.statusText}`
        );
      }

      return (await res.json()) as RecSvcResult;

    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new BadGatewayException(
          `rec-svc timeout after ${this.timeoutMs}ms (${endpoint})`
        );
      }

      throw new BadGatewayException(
        `rec-svc unreachable (${this.recUrl}${endpoint}): ${err?.message || err}`
      );

    } finally {
      clearTimeout(timeout);
    }
  }
}
