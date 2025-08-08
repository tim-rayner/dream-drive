import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

class RateLimiter {
  public config: RateLimitConfig;
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiters for different endpoints
const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many authentication attempts",
});

const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Too many API requests",
});

const generationRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: "Too many generation requests",
});

export function rateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): NextResponse | null {
  // Clean up expired entries
  limiter.cleanup();

  // Use IP address as identifier if not provided
  const clientId =
    identifier ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!limiter.isAllowed(clientId)) {
    const remainingTime = limiter.getRemainingTime(clientId);
    return NextResponse.json(
      {
        error: limiter.config.message || "Rate limit exceeded",
        retryAfter: Math.ceil(remainingTime / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(remainingTime / 1000).toString(),
          "X-RateLimit-Limit": limiter.config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(
            Date.now() + remainingTime
          ).toISOString(),
        },
      }
    );
  }

  return null;
}

export { apiRateLimiter, authRateLimiter, generationRateLimiter };
