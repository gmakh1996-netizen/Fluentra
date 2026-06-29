import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "usage_limit_reached"
  | "validation_error"
  | "provider_not_configured"
  | "internal_error";

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = (m = "Sign in to continue.") =>
  new ApiError("unauthorized", m, 401);
export const forbidden = (m = "You don't have access to this.") =>
  new ApiError("forbidden", m, 403);
export const notFound = (m = "Not found.") => new ApiError("not_found", m, 404);
export const usageLimitReached = (m = "You've reached your daily limit. Upgrade for more.") =>
  new ApiError("usage_limit_reached", m, 429);

/** Convert any thrown value into a clean JSON response. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "validation_error", message: "Invalid input.", details: err.flatten() } },
      { status: 400 },
    );
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json(
    { error: { code: "internal_error", message: "Something went wrong." } },
    { status: 500 },
  );
}
