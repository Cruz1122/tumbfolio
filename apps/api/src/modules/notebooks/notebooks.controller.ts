import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { NotebookIdParamDto } from "../../common/dto/uuid-param.dto.js";
import { NotebookSummaryDto } from "./dto/notebook.dto.js";
import type { NotebooksService } from "./notebooks.service.js";

@ApiTags("notebooks")
@ApiDefaultErrorResponses()
@Controller("notebooks")
export class NotebooksController {
  constructor(private readonly notebooksService: NotebooksService) {}

  @Get(":notebookId/summary")
  @ApiOkResponse({ type: NotebookSummaryDto })
  getSummary(
    @Param() params: NotebookIdParamDto,
  ): Promise<NotebookSummaryDto> {
    return this.notebooksService.getSummary(params.notebookId);
  }
}
