import { HttpException, type HttpStatus } from "@nestjs/common";
import type { ApiErrorCode } from "./api-error-code.js";

export type ApiExceptionPayload = {
  error_code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export class ApiException extends HttpException {
  constructor(
    public readonly errorCode: ApiErrorCode,
    message: string,
    status: HttpStatus,
    details?: unknown,
  ) {
    super(
      {
        error_code: errorCode,
        message,
        details,
      } satisfies ApiExceptionPayload,
      status,
    );
  }
}
