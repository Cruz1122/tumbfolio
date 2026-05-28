import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { CreateExportJobDto } from "./dto/create-export-job.dto.js";
import type { ExportJobDto } from "./dto/export-job.dto.js";

@Injectable()
export class ExportsService {
  create(_dto: CreateExportJobDto): Promise<ExportJobDto> {
    return this.notImplemented("Export job creation is not implemented yet.");
  }

  getById(_exportJobId: string): Promise<ExportJobDto> {
    return this.notImplemented("Export job lookup is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
