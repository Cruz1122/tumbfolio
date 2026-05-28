import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type {
  PresentationIdParamDto,
  SlideIdParamDto,
} from "../../common/dto/uuid-param.dto.js";
import { SlideDto } from "./dto/slide.dto.js";
import type { UpdateSlideDto } from "./dto/update-slide.dto.js";
import type { SlidesService } from "./slides.service.js";

@ApiTags("slides")
@ApiDefaultErrorResponses()
@Controller()
export class SlidesController {
  constructor(private readonly slidesService: SlidesService) {}

  @Get("presentations/:presentationId/slides")
  @ApiOkResponse({ type: [SlideDto] })
  listByPresentation(
    @Param() params: PresentationIdParamDto,
  ): Promise<SlideDto[]> {
    return this.slidesService.listByPresentation(params.presentationId);
  }

  @Patch("slides/:slideId")
  @ApiOkResponse({ type: SlideDto })
  update(
    @Param() params: SlideIdParamDto,
    @Body() dto: UpdateSlideDto,
  ): Promise<SlideDto> {
    return this.slidesService.update(params.slideId, dto);
  }
}
