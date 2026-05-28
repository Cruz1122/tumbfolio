import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { ExportJobIdParamDto } from "../../common/dto/uuid-param.dto.js";
import type { CreateExportJobDto } from "./dto/create-export-job.dto.js";
import { ExportJobDto } from "./dto/export-job.dto.js";
import type { ExportsService } from "./exports.service.js";

@ApiTags("exports")
@ApiDefaultErrorResponses()
@Controller("exports")
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  @ApiCreatedResponse({ type: ExportJobDto })
  create(@Body() dto: CreateExportJobDto): Promise<ExportJobDto> {
    return this.exportsService.create(dto);
  }

  @Get(":exportJobId")
  @ApiOkResponse({ type: ExportJobDto })
  getById(@Param() params: ExportJobIdParamDto): Promise<ExportJobDto> {
    return this.exportsService.getById(params.exportJobId);
  }
}
