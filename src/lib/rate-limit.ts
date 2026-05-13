import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = { success: boolean; remaining: number; reset: number };

const memoryBuckets = new Map<
  string,
  { count: number; resetAt: number }
>();

const windowMs = 60_000;
const maxRequests = 60;

function memoryLimit(key: string): LimitResult {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }
  if (bucket.count >= maxRequests) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }
  bucket.count += 1;
  return {
    success: true,
    remaining: maxRequests - bucket.count,
    reset: bucket.resetAt,
  };
}

let edgeLimiter: Ratelimit | null = null;

function getEdgeLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!edgeLimiter) {
    edgeLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(maxRequests, "1 m"),
      analytics: true,
      prefix: "dunaai",
    });
  }
  return edgeLimiter;
}

export async function rateLimit(identifier: string): Promise<LimitResult> {
  const redis = getEdgeLimiter();
  if (redis) {
    try {
      const res = await redis.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (error) {
      console.warn(
        "Upstash rate limiter unavailable, using in-memory fallback",
        error,
      );
    }
  }
  return memoryLimit(identifier);
}
