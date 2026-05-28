import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module.js";
import { QueuesModule } from "./modules/queues/queues.module.js";

@Module({
  imports: [HealthModule, QueuesModule.register()]
})
export class WorkerModule {}
