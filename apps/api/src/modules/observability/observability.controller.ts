import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("observability")
@Controller("observability")
export class ObservabilityController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "observability",
      timestamp: new Date().toISOString()
    };
  }
}
