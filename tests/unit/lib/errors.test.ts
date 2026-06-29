import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";
import { ApiError, unauthorized, forbidden, notFound, usageLimitReached, toErrorResponse } from "@/lib/errors";

describe("ApiError", () => {
  it("stores code, message, status", () => {
    const err = new ApiError("unauthorized", "Not signed in", 401);
    expect(err.code).toBe("unauthorized");
    expect(err.message).toBe("Not signed in");
    expect(err.status).toBe(401);
    expect(err.name).toBe("ApiError");
  });

  it("stores optional details", () => {
    const err = new ApiError("validation_error", "Bad input", 400, { field: "email" });
    expect(err.details).toEqual({ field: "email" });
  });

  it("is an instance of Error", () => {
    expect(new ApiError("forbidden", "msg", 403)).toBeInstanceOf(Error);
  });
});

describe("error factory helpers", () => {
  it("unauthorized() returns 401 ApiError", () => {
    const e = unauthorized();
    expect(e.status).toBe(401);
    expect(e.code).toBe("unauthorized");
  });

  it("forbidden() returns 403 ApiError", () => {
    const e = forbidden();
    expect(e.status).toBe(403);
    expect(e.code).toBe("forbidden");
  });

  it("notFound() returns 404 ApiError", () => {
    const e = notFound();
    expect(e.status).toBe(404);
    expect(e.code).toBe("not_found");
  });

  it("usageLimitReached() returns 429 ApiError", () => {
    const e = usageLimitReached();
    expect(e.status).toBe(429);
    expect(e.code).toBe("usage_limit_reached");
  });

  it("helpers accept custom messages", () => {
    expect(unauthorized("Custom message").message).toBe("Custom message");
    expect(forbidden("No access").message).toBe("No access");
    expect(notFound("Missing resource").message).toBe("Missing resource");
  });
});

describe("toErrorResponse", () => {
  it("returns correct status for ApiError", async () => {
    const res = toErrorResponse(new ApiError("unauthorized", "Not signed in", 401));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("unauthorized");
    expect(body.error.message).toBe("Not signed in");
  });

  it("returns 403 for forbidden ApiError", async () => {
    const res = toErrorResponse(forbidden("No access"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("forbidden");
  });

  it("returns 400 with validation_error for ZodError", async () => {
    const result = z.object({ email: z.string().email() }).safeParse({ email: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const res = toErrorResponse(result.error);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("validation_error");
      expect(body.error.details).toBeDefined();
    }
  });

  it("returns 500 for unknown errors", async () => {
    const res = toErrorResponse(new Error("Something unexpected"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("internal_error");
  });

  it("returns 500 for non-Error thrown values", async () => {
    const res = toErrorResponse("string error");
    expect(res.status).toBe(500);
  });

  it("preserves details on ApiError", async () => {
    const err = new ApiError("validation_error", "Invalid", 400, { field: "name" });
    const res = toErrorResponse(err);
    const body = await res.json();
    expect(body.error.details).toEqual({ field: "name" });
  });
});
