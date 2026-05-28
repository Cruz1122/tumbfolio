import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("notebooks")
@Controller("notebooks")
export class NotebooksController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "notebooks",
      timestamp: new Date().toISOString()
    };
  }
}
