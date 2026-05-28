import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("sharing")
@Controller("sharing")
export class SharingController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "sharing",
      timestamp: new Date().toISOString()
    };
  }
}
