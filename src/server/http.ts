import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(status: number, code: string, details?: unknown) {
  return NextResponse.json({ error: { code, details } }, { status });
}

/** Wraps a route handler: maps validation errors to 400 and hides internals on 500. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) return errorResponse(400, "VALIDATION_ERROR", err.flatten().fieldErrors);
      if (err instanceof SyntaxError) return errorResponse(400, "INVALID_JSON");
      console.error("[api]", err);
      return errorResponse(500, "INTERNAL_ERROR");
    }
  };
}

/** Very small in-memory rate limiter for public form endpoints (per instance). */
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
