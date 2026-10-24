import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();

// Initialize Upstash Redis if configured, otherwise fallback to in-memory
const redis =
  env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN,
      })
    : null;

export async function getCached<T>(key: string): Promise<T | null> {
  const normalizedKey = `the-bill:${key}`;

  if (redis) {
    try {
      const data = await redis.get<T>(normalizedKey);
      if (data !== null && data !== undefined) {
        return data;
      }
    } catch (err) {
      console.warn(`[Redis Error] get failed for key "${key}", falling back to memory:`, err);
    }
  }

  const memEntry = memoryCache.get(normalizedKey);
  if (memEntry) {
    if (Date.now() < memEntry.expiresAt) {
      return memEntry.value as T;
    }
    memoryCache.delete(normalizedKey);
  }

  return null;
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number = 86400 * 7 // default 7 days
): Promise<void> {
  const normalizedKey = `the-bill:${key}`;

  if (redis) {
    try {
      await redis.set(normalizedKey, value, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn(`[Redis Error] set failed for key "${key}", falling back to memory:`, err);
    }
  }

  memoryCache.set(normalizedKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
