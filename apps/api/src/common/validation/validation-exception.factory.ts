import { HttpStatus, type ValidationError } from "@nestjs/common";
import { ApiErrorCode } from "../errors/api-error-code.js";
import { ApiException } from "../errors/api.exception.js";

export function validationExceptionFactory(errors: ValidationError[]) {
  return new ApiException(
    ApiErrorCode.VALIDATION_FAILED,
    "Request validation failed.",
    HttpStatus.BAD_REQUEST,
    flattenValidationErrors(errors),
  );
}

function flattenValidationErrors(errors: ValidationError[]) {
  return errors.flatMap((error) => flattenValidationError(error));
}

function flattenValidationError(
  error: ValidationError,
  parentPath?: string,
): Array<{ field: string; messages: string[] }> {
  const field = parentPath ? `${parentPath}.${error.property}` : error.property;
  const ownMessages = error.constraints ? Object.values(error.constraints) : [];

  const childMessages =
    error.children?.flatMap((child) => flattenValidationError(child, field)) ??
    [];

  return ownMessages.length > 0
    ? [{ field, messages: ownMessages }, ...childMessages]
    : childMessages;
}
