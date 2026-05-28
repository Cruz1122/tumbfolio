import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UsersController {
  @Get("health")
  getModuleHealth() {
    return {
      status: "ok",
      module: "users",
      timestamp: new Date().toISOString()
    };
  }
}
