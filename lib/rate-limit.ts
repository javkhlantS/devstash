import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Pre-configured limiters for auth endpoints
export const rateLimiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "ratelimit:login",
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "ratelimit:register",
  }),
  forgotPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "ratelimit:forgot-password",
  }),
  resetPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "ratelimit:reset-password",
  }),
  resendVerification: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "15 m"),
    prefix: "ratelimit:resend-verification",
  }),
};

export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function rateLimitKey(ip: string, identifier?: string): string {
  return identifier ? `${ip}:${identifier}` : ip;
}

export function rateLimitResponse(resetMs: number): NextResponse {
  const retryAfterSeconds = Math.ceil((resetMs - Date.now()) / 1000);
  const minutes = Math.ceil(retryAfterSeconds / 60);

  return NextResponse.json(
    {
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

interface RateLimitCheckResult {
  limited: boolean;
  response?: NextResponse;
}

export async function checkRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<RateLimitCheckResult> {
  try {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      return { limited: true, response: rateLimitResponse(reset) };
    }
    return { limited: false };
  } catch {
    // Fail open — allow request if Upstash is unavailable
    return { limited: false };
  }
}
