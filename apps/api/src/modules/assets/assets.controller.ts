import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("assets")
@Controller("assets")
export class AssetsController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "assets",
      timestamp: new Date().toISOString()
    };
  }
}
