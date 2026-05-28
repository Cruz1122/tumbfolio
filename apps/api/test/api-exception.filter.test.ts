import { HttpStatus } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { ApiErrorCode } from "../src/common/errors/api-error-code.js";
import { ApiException } from "../src/common/errors/api.exception.js";

describe("ApiException", () => {
  it("keeps error code, message and status", () => {
    const exception = new ApiException(
      ApiErrorCode.PROJECT_NOT_FOUND,
      "Project not found.",
      HttpStatus.NOT_FOUND,
    );

    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toMatchObject({
      error_code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    });
  });
});
