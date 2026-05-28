import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { SlideDto } from "./dto/slide.dto.js";
import type { UpdateSlideDto } from "./dto/update-slide.dto.js";

@Injectable()
export class SlidesService {
  listByPresentation(_presentationId: string): Promise<SlideDto[]> {
    return this.notImplemented("Slide listing is not implemented yet.");
  }

  update(_slideId: string, _dto: UpdateSlideDto): Promise<SlideDto> {
    return this.notImplemented("Slide update is not implemented yet.");
  }

  private notImplemented(message: string): never {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      message,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
