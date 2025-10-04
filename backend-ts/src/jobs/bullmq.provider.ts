import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis(
  process.env.REDIS_URL ?? "redis://localhost:6379"
);
export const HelloQueue = new Queue("hello", { connection });
export function startHelloWorker() {
  const w = new Worker(
    "hello",
    async (job) => ({ echo: `Hello ${job.data.name ?? "world"}` }),
    { connection }
  );
  w.on("completed", (j) => console.log("hello done:", j.id));
  w.on("failed", (j, e) => console.error("hello failed:", j?.id, e.message));
}
