import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { NotebookIdParamDto } from "../../common/dto/uuid-param.dto.js";
import {
  CompleteNotebookUploadDto,
  CompleteNotebookUploadResponseDto,
} from "./dto/complete-notebook-upload.dto.js";
import {
  InitiateNotebookUploadDto,
  InitiateNotebookUploadResponseDto,
} from "./dto/initiate-notebook-upload.dto.js";
import {
  GetNotebookCellsQueryDto,
  NotebookCellsResponseDto,
  NotebookSummaryDto,
  ParseNotebookQueryDto,
  ParseNotebookResponseDto,
} from "./dto/notebook.dto.js";
import { NotebookParserService } from "./notebook-parser.service.js";
import { NotebookUploadsService } from "./notebook-uploads.service.js";
import { NotebookValidationService } from "./notebook-validation.service.js";
import { NotebooksService } from "./notebooks.service.js";

@ApiTags("notebooks")
@ApiDefaultErrorResponses()
@Controller("notebooks")
export class NotebooksController {
  constructor(
    private readonly notebooksService: NotebooksService,
    private readonly notebookUploadsService: NotebookUploadsService,
    private readonly notebookValidationService: NotebookValidationService,
    private readonly notebookParserService: NotebookParserService,
  ) {}

  @Post("uploads/initiate")
  @ApiCreatedResponse({ type: InitiateNotebookUploadResponseDto })
  initiateUpload(
    @Body() body: InitiateNotebookUploadDto,
  ): Promise<InitiateNotebookUploadResponseDto> {
    return this.notebookUploadsService.initiateUpload(body);
  }

  @Post("uploads/complete")
  @ApiCreatedResponse({ type: CompleteNotebookUploadResponseDto })
  completeUpload(
    @Body() body: CompleteNotebookUploadDto,
  ): Promise<CompleteNotebookUploadResponseDto> {
    return this.notebookUploadsService.completeUpload(body);
  }

  @Post(":notebookId/validate")
  @ApiOkResponse({ type: NotebookSummaryDto })
  validateNotebook(
    @Param() params: NotebookIdParamDto,
  ): Promise<NotebookSummaryDto> {
    return this.notebookValidationService.validateNotebook(params.notebookId);
  }

  @Post(":notebookId/parse")
  @ApiOkResponse({ type: ParseNotebookResponseDto })
  parseNotebook(
    @Param() params: NotebookIdParamDto,
    @Query() query: ParseNotebookQueryDto,
  ): Promise<ParseNotebookResponseDto> {
    return this.notebookParserService.parseNotebook(params.notebookId, query);
  }

  @Get(":notebookId/summary")
  @ApiOkResponse({ type: NotebookSummaryDto })
  getSummary(
    @Param() params: NotebookIdParamDto,
  ): Promise<NotebookSummaryDto> {
    return this.notebooksService.getSummary(params.notebookId);
  }

  @Get(":notebookId/cells")
  @ApiOkResponse({ type: NotebookCellsResponseDto })
  getCells(
    @Param() params: NotebookIdParamDto,
    @Query() query: GetNotebookCellsQueryDto,
  ): Promise<NotebookCellsResponseDto> {
    return this.notebookParserService.getCells(params.notebookId, query);
  }
}
