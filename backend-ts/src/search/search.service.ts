import { BadGatewayException, Injectable } from "@nestjs/common";

type RecSvcResult = {
  results: Array<{ id: string; score: number; [k: string]: any }>;
};

@Injectable()
export class SearchService {
  private recUrl = process.env.REC_SVC_URL || "http://localhost:8001";
  private timeoutMs = +(process.env.REC_SVC_TIMEOUT_MS || 8000);

<<<<<<< HEAD
  /**
   * 🔹 Returns mock results (used when mock=1 or for testing)
   */
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
  /**
   * 🔹 Perform image-based search through rec_svc (FastAPI)
   */
=======
>>>>>>> origin/main
  async imageSearch(imageUrl: string, topK = 10): Promise<RecSvcResult> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.recUrl}/search/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify({ imageUrl, k: topK }),
        signal: controller.signal,
      });

=======
        body: JSON.stringify({ imageUrl, topK }),
        signal: controller.signal,
      });
>>>>>>> origin/main
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new BadGatewayException(
          `rec-svc ${res.status}: ${text || res.statusText}`
        );
      }
<<<<<<< HEAD

=======
>>>>>>> origin/main
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
<<<<<<< HEAD

  /**
   * 🔹 Perform text-based search through rec_svc (FastAPI)
   */
  async textSearch(query: string, topK = 5): Promise<RecSvcResult> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = new URL(`${this.recUrl}/search/text`);
      url.searchParams.append("q", query);
      url.searchParams.append("k", String(topK));

      const res = await fetch(url, { signal: controller.signal });

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
        `rec-svc unreachable (${this.recUrl}/search/text): ${
          err?.message || err
        }`
      );
    } finally {
      clearTimeout(t);
    }
  }
=======
>>>>>>> origin/main
}
