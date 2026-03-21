// backend/src/lib/bigintUtils.ts

/**
 * Parse bigint from API request body. Throws 400-friendly error on bad input.
 */
export function parseBigIntField(value: unknown, fieldName: string): bigint {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) {
    throw new Error(`${fieldName} must be a non-negative integer string (received: ${str})`);
  }
  return BigInt(str);
}

/**
 * Safely parse bigint from DB string field. Returns 0n on failure.
 */
export function fromDbString(str: string | null | undefined): bigint {
  if (!str) return 0n;
  try { return BigInt(str); } catch { return 0n; }
}
/**
 * Serialize bigint for Prisma String field storage.
 */
export function toDbString(wei: bigint): string {
  return wei.toString();
}
