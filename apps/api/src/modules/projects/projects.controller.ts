import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "projects",
      timestamp: new Date().toISOString()
    };
  }
}
