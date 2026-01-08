import { createError, getRequestIP } from "h3";
import type { H3Event } from "h3";

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

const getClientId = (event: H3Event) => {
  return (
    getRequestIP(event) ||
    event.node.req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    event.node.req.headers["x-real-ip"]?.toString() ||
    event.node.req.socket?.remoteAddress ||
    "unknown"
  );
};

export const enforceRateLimit = (
  event: H3Event,
  key: string,
  limit: number,
  windowMs: number
) => {
  const now = Date.now();
  const clientId = getClientId(event);
  const bucketKey = `${clientId}:${key}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.reset <= now) {
    buckets.set(bucketKey, { count: 1, reset: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests"
    });
  }

  bucket.count += 1;
};
