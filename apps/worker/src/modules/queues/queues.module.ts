import type { DynamicModule} from "@nestjs/common";
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { loadWorkerEnv, parseRedisUrl } from "@tumbfolio/config";
import { AssetJobsProcessor } from "./processors/asset-jobs.processor.js";
import { ExportJobsProcessor } from "./processors/export-jobs.processor.js";
import { NbxpJobsProcessor } from "./processors/nbxp-jobs.processor.js";
import { NotebookJobsProcessor } from "./processors/notebook-jobs.processor.js";
import { ASSET_QUEUE, EXPORT_QUEUE, NBXP_QUEUE, NOTEBOOK_QUEUE } from "./queue-names.js";

@Module({})
export class QueuesModule {
  static register(): DynamicModule {
    const env = loadWorkerEnv();

    if (!env.WORKER_QUEUES_ENABLED) {
      return {
        module: QueuesModule,
        providers: []
      };
    }

    return {
      module: QueuesModule,
      imports: [
        BullModule.forRoot({ connection: parseRedisUrl(env.REDIS_URL) }),
        BullModule.registerQueue(
          { name: NOTEBOOK_QUEUE },
          { name: EXPORT_QUEUE },
          { name: NBXP_QUEUE },
          { name: ASSET_QUEUE }
        )
      ],
      providers: [NotebookJobsProcessor, ExportJobsProcessor, NbxpJobsProcessor, AssetJobsProcessor]
    };
  }
}
