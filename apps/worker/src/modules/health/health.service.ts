import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@tumbfolio/domain";

@Injectable()
export class WorkerHealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "worker",
      timestamp: new Date().toISOString(),
      version: "0.0.0"
    };
  }
}
