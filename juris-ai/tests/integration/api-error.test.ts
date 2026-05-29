import { describe, it, expect } from "vitest";

import { ApiError, toErrorResponse } from "@/lib/errors/api-error";

describe("ApiError", () => {
  it("should create error with default status 500", () => {
    const err = new ApiError("Something failed");
    expect(err.message).toBe("Something failed");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBeUndefined();
    expect(err.name).toBe("ApiError");
  });

  it("should create error with custom status code and code", () => {
    const err = new ApiError("Not found", 404, "NOT_FOUND");
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("should convert ApiError to Response", () => {
    const err = new ApiError("Invalid input", 400, "VALIDATION_ERROR");
    const response = toErrorResponse(err);
    expect(response.status).toBe(400);
  });

  it("should convert unknown error to 500 Response", () => {
    const response = toErrorResponse(new Error("Unexpected"));
    expect(response.status).toBe(500);
  });
});
