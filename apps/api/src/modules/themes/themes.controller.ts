import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import { ThemeDto } from "./dto/theme.dto.js";
import type { ThemesService } from "./themes.service.js";

@ApiTags("themes")
@ApiDefaultErrorResponses()
@Controller("themes")
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOkResponse({ type: [ThemeDto] })
  list(): Promise<ThemeDto[]> {
    return this.themesService.list();
  }
}
