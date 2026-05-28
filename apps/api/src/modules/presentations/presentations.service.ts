import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { PresentationDto } from "./dto/presentation.dto.js";
import type { UpdatePresentationDto } from "./dto/update-presentation.dto.js";

@Injectable()
export class PresentationsService {
  getById(_presentationId: string): Promise<PresentationDto> {
    return this.notImplemented("Presentation lookup is not implemented yet.");
  }

  update(
    _presentationId: string,
    _dto: UpdatePresentationDto,
  ): Promise<PresentationDto> {
    return this.notImplemented("Presentation update is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
