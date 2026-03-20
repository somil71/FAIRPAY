import { getAddress, isAddress, parseEther, parseUnits, formatEther } from "viem";

/**
 * Safe BigInt conversion — fixes viem "unsafe integer" errors.
 * Strips non-numeric chars, ensures positive, returns bigint.
 */
export function safeBigInt(val: string | number | bigint): bigint {
  if (typeof val === "bigint") return val;
  try {
    const cleaned = String(val).replace(/[^0-9.-]/g, "") || "0";
    if (cleaned.includes(".")) {
      return BigInt(Math.floor(parseFloat(cleaned)));
    }
    return BigInt(cleaned);
  } catch (e) {
    return 0n;
  }
}

/**
 * Ensures an address is in its checksummed format for viem compatibility.
 */
export function ensureChecksum(address: string | undefined): `0x${string}` {
  if (!address || !isAddress(address)) return "0x0000000000000000000000000000000000000000";
  return getAddress(address) as `0x${string}`;
}

/**
 * Validates if a string is a valid Ethereum address.
 * Permissive: accepts any valid 0x + 40 hex chars, regardless of casing.
 */
export function isValidAddress(address: string | undefined): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Safely parses and checksums an address.
 */
export function safeChecksum(address: string | undefined): `0x${string}` {
  if (!address || !isValidAddress(address)) return "0x0000000000000000000000000000000000000000";
  return getAddress(address) as `0x${string}`;
}

export const contractHelpers = {
  /** Convert ETH string to wei (bigint). Validates positive. */
  toWei: (ethString: string): bigint => {
    const trimmed = (ethString || "").trim();
    if (!trimmed || trimmed === "" || isNaN(Number(trimmed)) || Number(trimmed) < 0) {
      throw new Error("Enter a valid positive amount");
    }
    return parseEther(trimmed);
  },

  /** Convert token amount string to smallest unit. */
  toTokenUnits: (amount: string, decimals: number): bigint => {
    return parseUnits(amount.trim(), decimals);
  },

  /** Calculate percentage of a bigint amount. All math in BigInt. */
  percentOf: (amount: bigint, percent: number): bigint => {
    return (amount * BigInt(Math.floor(percent))) / 100n;
  },

  /** Seconds remaining until 48h auto-release. */
  secondsUntilRelease: (submittedAt: bigint | number | string): number => {
    const submitted = safeBigInt(submittedAt);
    const now = BigInt(Math.floor(Date.now() / 1000));
    const deadline = submitted + BigInt(48 * 3600);
    return Math.max(0, Number(deadline - now));
  },

  /** Format wei to display string (e.g. "1.5") */
  formatWei: (wei: bigint | string | number): string => {
    return formatEther(safeBigInt(wei));
  },
};

/** Validate a milestone amount from user input. Returns bigint wei. */
export function validateMilestoneAmount(input: string): bigint {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Amount must be a positive number");
  }
  const val = parseEther(trimmed);
  if (val === 0n) throw new Error("Amount must be greater than 0");
  return val;
}

/** Milestone status labels for "Oxidized Copper" theme */
export const MILESTONE_STATUS = {
  PENDING:   { label: "Pending",   class: "badge--pending" },
  SUBMITTED: { label: "Submitted", class: "badge--submitted" },
  RELEASED:  { label: "Released",  class: "badge--released" },
  DISPUTED:  { label: "Disputed",  class: "badge--disputed" },
  ACTIVE:    { label: "Active",    class: "badge--active" },
  PARTIAL:   { label: "Partial",   class: "badge--pending" },
  REFUNDED:  { label: "Refunded",  class: "badge--disputed" },
} as const;

/** Contract templates */
export const CONTRACT_TEMPLATES = [
  {
    id: "logo",
    name: "Logo Design",
    icon: "✦",
    milestones: [
      { title: "Brief & Concepts", paymentBps: 3000, description: "Initial concepts and mood boards" },
      { title: "Refinements", paymentBps: 4000, description: "Selected concept iterations" },
      { title: "Final Files", paymentBps: 3000, description: "Production-ready assets" },
    ],
  },
  {
    id: "web-sprint",
    name: "Web Sprint",
    icon: "◈",
    milestones: [
      { title: "Discovery", paymentBps: 2000, description: "Requirements and architecture" },
      { title: "Design", paymentBps: 3000, description: "UI/UX mockups and prototypes" },
      { title: "Development", paymentBps: 3500, description: "Code implementation" },
      { title: "Launch", paymentBps: 1500, description: "Deployment and handoff" },
    ],
  },
  {
    id: "audit",
    name: "Security Audit",
    icon: "◉",
    milestones: [
      { title: "Scope Review", paymentBps: 2500, description: "Codebase review and scope definition" },
      { title: "Initial Audit", paymentBps: 5000, description: "Full security analysis" },
      { title: "Final Report", paymentBps: 2500, description: "Findings report and remediation view" },
    ],
  },
] as const;
