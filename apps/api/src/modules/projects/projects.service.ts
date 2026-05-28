import { HttpStatus, Injectable } from "@nestjs/common";
import type { PageQueryDto } from "../../common/dto/page-query.dto.js";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { CreateProjectDto } from "./dto/create-project.dto.js";
import type { ProjectDetailDto, ProjectListResponseDto } from "./dto/project.dto.js";
import type { UpdateProjectDto } from "./dto/update-project.dto.js";

@Injectable()
export class ProjectsService {
  list(_query: PageQueryDto): Promise<ProjectListResponseDto> {
    return this.notImplemented("Project listing is not implemented yet.");
  }

  create(_dto: CreateProjectDto): Promise<ProjectDetailDto> {
    return this.notImplemented("Project creation is not implemented yet.");
  }

  getById(_projectId: string): Promise<ProjectDetailDto> {
    return this.notImplemented("Project lookup is not implemented yet.");
  }

  update(_projectId: string, _dto: UpdateProjectDto): Promise<ProjectDetailDto> {
    return this.notImplemented("Project update is not implemented yet.");
  }

  archive(_projectId: string): Promise<{ archived: true }> {
    return this.notImplemented("Project archive is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
