import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { CreateNbxpExportDto, NbxpExportDto } from "./dto/nbxp.dto.js";

@Injectable()
export class NbxpService {
  createExport(_dto: CreateNbxpExportDto): Promise<NbxpExportDto> {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      "NBXP export is not implemented yet. T-22 will connect serializer and export jobs.",
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
