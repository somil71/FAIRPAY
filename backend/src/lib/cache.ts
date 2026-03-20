import redis from "./redis";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch { /* ignore */ }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch { /* ignore */ }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    const keysToDelete: string[] = [];
    do {
      const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = newCursor;
      keysToDelete.push(...keys);
    } while (cursor !== "0");
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
  } catch { /* ignore */ }
}
