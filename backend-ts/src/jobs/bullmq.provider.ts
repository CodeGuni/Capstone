import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const HelloQueue = new Queue("hello", { connection });

export function startHelloWorker() {
  const worker = new Worker(
    "hello",
    async (job) => {
      return { message: `Hello ${job.data?.name ?? "world"}` };
    },
    { connection }
  );

  worker.on("completed", (j) => console.log("hello done:", j.id));
  worker.on("failed", (j, e) => console.error("hello failed:", j?.id, e));
}
