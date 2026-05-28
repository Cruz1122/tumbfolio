import type {
  ArgumentsHost,
  ExceptionFilter} from "@nestjs/common";
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { ApiErrorCode } from "./api-error-code.js";
import { ApiException } from "./api.exception.js";

type NormalizedError = {
  status: number;
  error_code: ApiErrorCode;
  message: string;
  details?: unknown;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const normalized = this.normalize(exception);
    const requestId = request.requestId ?? randomUUID();

    if (normalized.status >= 500) {
      this.logger.error(
        {
          requestId,
          method: request.method,
          path: request.url,
          errorCode: normalized.error_code,
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(normalized.status).json({
      error_code: normalized.error_code,
      message: normalized.message,
      details: normalized.details,
      path: request.url,
      method: request.method,
      request_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof ApiException) {
      const body = exception.getResponse() as {
        error_code: ApiErrorCode;
        message: string;
        details?: unknown;
      };

      return {
        status: exception.getStatus(),
        error_code: body.error_code,
        message: body.message,
        details: body.details,
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();

      if (typeof response === "object" && response !== null) {
        const body = response as Record<string, unknown>;

        return {
          status,
          error_code: this.mapStatusToCode(status),
          message:
            typeof body.message === "string"
              ? body.message
              : this.defaultMessage(status),
          details: body.message,
        };
      }

      return {
        status,
        error_code: this.mapStatusToCode(status),
        message:
          typeof response === "string" ? response : this.defaultMessage(status),
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error_code: ApiErrorCode.INTERNAL_ERROR,
      message: "Unexpected server error.",
    };
  }

  private mapStatusToCode(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      case HttpStatus.NOT_IMPLEMENTED:
        return ApiErrorCode.NOT_IMPLEMENTED;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  private defaultMessage(status: number): string {
    if (status >= 500) return "Unexpected server error.";
    return "Request failed.";
  }
}
