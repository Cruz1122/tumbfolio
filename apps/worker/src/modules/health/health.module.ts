import { Inject, Module } from "@nestjs/common";
import type { OnModuleInit } from "@nestjs/common";
import { WorkerHealthService } from "./health.service.js";

@Module({
  providers: [WorkerHealthService],
  exports: [WorkerHealthService]
})
export class HealthModule implements OnModuleInit {
  constructor(@Inject(WorkerHealthService) private readonly healthService: WorkerHealthService) {}

  onModuleInit(): void {
    const health = this.healthService.getHealth();
    console.log(`${health.service} health=${health.status} timestamp=${health.timestamp}`);
  }
}
