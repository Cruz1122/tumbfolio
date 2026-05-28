import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("slides")
@Controller("slides")
export class SlidesController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "slides",
      timestamp: new Date().toISOString()
    };
  }
}
