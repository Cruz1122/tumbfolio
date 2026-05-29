import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { PresentationIdParamDto } from "../../common/dto/uuid-param.dto.js";
import { PresentationDto } from "./dto/presentation.dto.js";
import type { UpdatePresentationDto } from "./dto/update-presentation.dto.js";
import { PresentationsService } from "./presentations.service.js";

@ApiTags("presentations")
@ApiDefaultErrorResponses()
@Controller("presentations")
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  @Get(":presentationId")
  @ApiOkResponse({ type: PresentationDto })
  getById(
    @Param() params: PresentationIdParamDto,
  ): Promise<PresentationDto> {
    return this.presentationsService.getById(params.presentationId);
  }

  @Patch(":presentationId")
  @ApiOkResponse({ type: PresentationDto })
  update(
    @Param() params: PresentationIdParamDto,
    @Body() dto: UpdatePresentationDto,
  ): Promise<PresentationDto> {
    return this.presentationsService.update(params.presentationId, dto);
  }
}
