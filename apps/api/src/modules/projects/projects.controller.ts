import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ApiDefaultErrorResponses } from "../../common/decorators/api-error-responses.decorator.js";
import type { PageQueryDto } from "../../common/dto/page-query.dto.js";
import type { ProjectIdParamDto } from "../../common/dto/uuid-param.dto.js";
import type { CreateProjectDto } from "./dto/create-project.dto.js";
import { ProjectDetailDto, ProjectListResponseDto } from "./dto/project.dto.js";
import type { UpdateProjectDto } from "./dto/update-project.dto.js";
import type { ProjectsService } from "./projects.service.js";

@ApiTags("projects")
@ApiDefaultErrorResponses()
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ type: ProjectListResponseDto })
  list(@Query() query: PageQueryDto): Promise<ProjectListResponseDto> {
    return this.projectsService.list(query);
  }

  @Post()
  @ApiCreatedResponse({ type: ProjectDetailDto })
  create(@Body() dto: CreateProjectDto): Promise<ProjectDetailDto> {
    return this.projectsService.create(dto);
  }

  @Get(":projectId")
  @ApiOkResponse({ type: ProjectDetailDto })
  getById(@Param() params: ProjectIdParamDto): Promise<ProjectDetailDto> {
    return this.projectsService.getById(params.projectId);
  }

  @Patch(":projectId")
  @ApiOkResponse({ type: ProjectDetailDto })
  update(
    @Param() params: ProjectIdParamDto,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDetailDto> {
    return this.projectsService.update(params.projectId, dto);
  }

  @Delete(":projectId")
  @ApiOkResponse({ schema: { example: { archived: true } } })
  archive(@Param() params: ProjectIdParamDto): Promise<{ archived: true }> {
    return this.projectsService.archive(params.projectId);
  }
}
