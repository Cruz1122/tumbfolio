import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("presentations")
@Controller("presentations")
export class PresentationsController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "presentations",
      timestamp: new Date().toISOString()
    };
  }
}
