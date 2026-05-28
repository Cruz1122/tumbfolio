import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "ai",
      timestamp: new Date().toISOString()
    };
  }
}
