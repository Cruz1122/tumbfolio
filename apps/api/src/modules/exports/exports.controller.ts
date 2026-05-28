import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("exports")
@Controller("exports")
export class ExportsController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "exports",
      timestamp: new Date().toISOString()
    };
  }
}
