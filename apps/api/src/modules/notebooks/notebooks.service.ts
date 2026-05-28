import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { NotebookSummaryDto } from "./dto/notebook.dto.js";

@Injectable()
export class NotebooksService {
  getSummary(_notebookId: string): Promise<NotebookSummaryDto> {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      "Notebook summary endpoint is prepared but not implemented. T-08 will connect validation results.",
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
