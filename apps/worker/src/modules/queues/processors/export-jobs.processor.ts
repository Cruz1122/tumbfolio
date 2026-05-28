import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { EXPORT_QUEUE } from "../queue-names.js";

@Processor(EXPORT_QUEUE)
export class ExportJobsProcessor extends WorkerHost {
  async process(job: Job): Promise<{ ok: true; jobId: string | number; queue: string }> {
    console.log(`Processing ${job.queueName} job ${job.id ?? "unknown"}`);
    return { ok: true, jobId: job.id ?? "unknown", queue: job.queueName };
  }
}
