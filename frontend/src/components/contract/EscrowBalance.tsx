"use client";
import React from "react";
import { contractHelpers, safeBigInt } from "@/lib/contractHelpers";

interface EscrowBalanceProps {
  total: string | bigint;
  released: string | bigint;
}

/**
 * EscrowBalance — Financial Noir Redesign
 * A serious, institutional-grade balance display.
 */
export default function EscrowBalance({ total, released }: EscrowBalanceProps) {
  const t = safeBigInt(total);
  const r = safeBigInt(released);
  const locked = t - r;
  
  // Calculate percentage using BigInt for precision, then convert to number for CSS width
  const pct = t > 0n ? Number((r * 10000n) / t) / 100 : 0;

  return (
    <div className="card p-8 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
            ACCOUNTING_LEDGER
          </span>
          <h3 className="text-2xl font-bold tracking-tight">ESCROW_LIQUIDITY</h3>
        </div>
        <div className="badge badge--active border-none bg-black/40 text-[var(--copper)]">
          SYNC_ACTIVE
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-mono font-medium tracking-tighter text-[var(--text-primary)]">
            {contractHelpers.formatWei(t)}
          </span>
          <span className="text-sm font-mono font-bold text-[var(--copper)] tracking-widest uppercase">
            ETH
          </span>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)] mt-2 uppercase tracking-wider">
          Total Locked Protocol Value
        </div>
      </div>
      
      {/* Progress Track — Segmented and elegant */}
      <div className="flex gap-1 h-2.5 w-full mb-8">
        <div 
          className="h-full bg-[var(--emerald)] rounded-l-sm transition-all duration-1000 ease-out shadow-[0_0_10px_var(--emerald-dim)]" 
          style={{ width: `${pct}%` }}
        />
        <div 
          className="h-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-r-sm transition-all duration-1000 flex-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--emerald)]" />
            <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">RELEASED</span>
          </div>
          <span className="text-xl font-mono font-medium text-[var(--text-primary)]">
            {contractHelpers.formatWei(r)} <span className="text-[10px] text-[var(--text-muted)]">ETH</span>
          </span>
        </div>
        
        <div className="flex flex-col gap-1 text-right items-end">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">PENDING_ESCROW</span>
            <div className="w-2 h-2 rounded-full bg-[var(--amber)]" />
          </div>
          <span className="text-xl font-mono font-medium text-[var(--amber)]">
            {contractHelpers.formatWei(locked)} <span className="text-[10px] text-[var(--text-muted)]">ETH</span>
          </span>
        </div>
      </div>
    </div>
  );
}
