import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("themes")
@Controller("themes")
export class ThemesController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "themes",
      timestamp: new Date().toISOString()
    };
  }
}
