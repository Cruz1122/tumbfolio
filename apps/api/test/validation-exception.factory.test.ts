import { describe, expect, it } from "vitest";
import { validationExceptionFactory } from "../src/common/validation/validation-exception.factory.js";

describe("validationExceptionFactory", () => {
  it("creates a safe validation exception", () => {
    const exception = validationExceptionFactory([
      {
        property: "name",
        constraints: {
          isString: "name must be a string",
        },
      },
    ]);

    expect(exception.getStatus()).toBe(400);
    expect(exception.getResponse()).toMatchObject({
      error_code: "VALIDATION_FAILED",
      message: "Request validation failed.",
    });
  });
});
