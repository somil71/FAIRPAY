import React from "react";
import { ensureChecksum } from "@/lib/contractHelpers";

interface AddressDisplayProps {
  address: string;
  label?: string;
  copyable?: boolean;
}

/**
 * AddressDisplay — Financial Noir Implementation
 * Features truncated mono address, checksum enforcement, and copy-on-click.
 */
export default function AddressDisplay({ 
  address, 
  label,
  copyable = true 
}: AddressDisplayProps) {
  const checksummed = ensureChecksum(address);
  const truncated = `${checksummed.slice(0, 6)}···${checksummed.slice(-4)}`;

  const copyToClipboard = () => {
    if (!copyable) return;
    navigator.clipboard.writeText(checksummed);
    // Simple visual feedback could be added here
  };

  return (
    <div className="flex flex-col gap-1 group">
      {label && (
        <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </span>
      )}
      <div 
        onClick={copyToClipboard}
        className={`flex items-center gap-2 font-mono text-sm ${copyable ? 'cursor-pointer hover:text-[var(--copper-bright)]' : ''} transition-colors text-[var(--text-secondary)]`}
        title={checksummed}
      >
        <div className="w-5 h-5 rounded-sm bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
          {/* Minimalist identicon placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-[var(--copper-dim)] to-[var(--bg-deep)] opacity-40" />
        </div>
        <span className="tracking-tight">{truncated}</span>
        {copyable && (
          <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 002-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 00-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        )}
      </div>
    </div>
  );
}
