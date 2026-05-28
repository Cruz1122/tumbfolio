import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("nbxp")
@Controller("nbxp")
export class NbxpController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "nbxp",
      timestamp: new Date().toISOString()
    };
  }
}
