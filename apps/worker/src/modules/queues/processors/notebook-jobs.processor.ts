import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { NOTEBOOK_QUEUE } from "../queue-names.js";

@Processor(NOTEBOOK_QUEUE)
export class NotebookJobsProcessor extends WorkerHost {
  async process(job: Job): Promise<{ ok: true; jobId: string | number; queue: string }> {
    console.log(`Processing ${job.queueName} job ${job.id ?? "unknown"}`);
    return { ok: true, jobId: job.id ?? "unknown", queue: job.queueName };
  }
}
