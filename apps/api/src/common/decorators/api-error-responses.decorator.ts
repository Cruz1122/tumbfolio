import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { ApiErrorResponseDto } from "../dto/api-error-response.dto.js";

export function ApiDefaultErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ApiErrorResponseDto }),
    ApiNotFoundResponse({ type: ApiErrorResponseDto }),
    ApiInternalServerErrorResponse({ type: ApiErrorResponseDto }),
  );
}
