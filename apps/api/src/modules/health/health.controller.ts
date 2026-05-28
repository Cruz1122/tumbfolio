import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { HealthResponse } from "@tumbfolio/domain";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
      version: "0.0.0"
    };
  }
}
