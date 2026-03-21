// src/lib/bigintUtils.ts
import { parseEther, parseUnits, formatEther, formatUnits } from 'viem';

/**
 * Parse a user-entered ETH string to bigint.
 * Throws with a user-friendly message on any invalid input.
 * Use on every form input before any contract/API call.
 */
export function parseEthInput(input: string): bigint {
  const trimmed = (input ?? '').trim();
  if (!trimmed) throw new Error('Amount is required');
  if (!/^\d+(\.\d{0,18})?$/.test(trimmed)) throw new Error('Enter a valid number (e.g. 1.5)');
  const result = parseEther(trimmed);
  if (result <= 0n) throw new Error('Amount must be greater than 0');
  return result;
}

/**
 * Parse a user-entered token amount string to bigint.
 */
export function parseTokenInput(input: string, decimals: number): bigint {
  const trimmed = (input ?? '').trim();
  if (!trimmed) throw new Error('Amount is required');
  const result = parseUnits(trimmed, decimals);
  if (result <= 0n) throw new Error('Amount must be greater than 0');
  return result;
}

/**
 * Safely deserialize bigint from DB/API string. Never throws — returns 0n.
 */
export function fromWeiString(weiStr: string | null | undefined): bigint {
  if (!weiStr) return 0n;
  try { return BigInt(weiStr); } catch { return 0n; }
}

/**
 * Serialize bigint to string for API/DB transport.
 */
export function toWeiString(wei: bigint): string {
  return wei.toString();
}

/**
 * Format bigint wei for display. Trims trailing zeros.
 * e.g. 1500000000000000000n → "1.5"
 */
export function displayEth(wei: bigint): string {
  const str = formatEther(wei);
  return parseFloat(str).toString();
}

/**
 * Format with fixed decimals for table/card display.
 * e.g. 1500000000000000000n → "1.50"
 */
export function displayEthFixed(wei: bigint, decimals = 2): string {
  return parseFloat(formatEther(wei)).toFixed(decimals);
}

/**
 * Safe percent math — fully bigint, never Number().
 * pct: integer 0–100
 */
export function percentOf(amount: bigint, pct: number): bigint {
  if (pct < 0 || pct > 100) throw new Error('Percent must be 0–100');
  return (amount * BigInt(Math.round(pct))) / 100n;
}

/**
 * Sum an array of bigint values safely.
 */
export function sumWei(amounts: bigint[]): bigint {
  return amounts.reduce((acc, v) => acc + v, 0n);
}

/**
 * JSON replacer for bigint — use when sending bigint in fetch bodies.
 * Usage: JSON.stringify(data, bigintReplacer)
 */
export const bigintReplacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;

/**
 * JSON reviver for bigint — use when receiving wei fields from API.
 * List of field names that should be parsed as bigint.
 */
export function makeBigintReviver(bigintFields: string[]) {
  return (_key: string, value: unknown) => {
    if (bigintFields.includes(_key) && typeof value === 'string') {
      try { return BigInt(value); } catch { return value; }
    }
    return value;
  };
}
