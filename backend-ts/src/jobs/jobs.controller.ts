import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HelloQueue } from "./bullmq.provider";
@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  @Post("hello")
  async hello(@Body() dto: { name?: string }) {
    const job = await HelloQueue.add("hello", { name: dto.name ?? "world" });
    return { enqueued: true, jobId: job.id };
  }
}
