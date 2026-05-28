import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { ThemeDto } from "./dto/theme.dto.js";

@Injectable()
export class ThemesService {
  list(): Promise<ThemeDto[]> {
    throw new ApiException(
      ApiErrorCode.NOT_IMPLEMENTED,
      "Theme listing is prepared but not connected to the database yet.",
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
