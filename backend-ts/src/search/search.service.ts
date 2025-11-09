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
}