import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

class HealthResponseDto {
  status!: "ok";
  service!: "api";
}

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return {
      status: "ok",
      service: "api",
    };
  }
}
