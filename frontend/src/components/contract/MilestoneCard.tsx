"use client";
import React from "react";
import { Milestone } from "@/types/contract";
import StatusBadge from "../shared/StatusBadge";
import CountdownTimer from "../shared/CountdownTimer";
import { MILESTONE_STATUS, contractHelpers, safeBigInt } from "@/lib/contractHelpers";

interface MilestoneCardProps {
  milestone: Milestone;
  role: "client" | "freelancer";
  onApprove?: () => void;
  onDispute?: (percent?: number) => void;
  onSubmit?: (hash: string, method: string) => void;
}

export default function MilestoneCard({ 
  milestone, 
  role,
  onApprove,
  onDispute,
  onSubmit 
}: MilestoneCardProps) {
  const isClient = role === "client";
  const isFreelancer = role === "freelancer";
  const amount = safeBigInt(milestone.amount);

  return (
    <div className="card p-8 relative group overflow-hidden border-l-4 border-[var(--border-subtle)] hover:border-[var(--copper)] transition-all">
      {/* Index Watermark */}
      <div className="absolute top-4 right-6 opacity-[0.03] text-[120px] font-display font-bold pointer-events-none select-none">
        {Number(milestone.index) + 1}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-widest bg-[var(--bg-deep)] px-3 py-1 rounded border border-[var(--border-subtle)]">
              MILESTONE_ID//0{Number(milestone.index) + 1}
            </span>
            <StatusBadge status={milestone.status} />
          </div>
          
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
             {milestone.title.replace(/_/g, " ")}
          </h3>
          
          <p className="text-sm font-body text-[var(--text-secondary)] leading-relaxed max-w-xl mb-8 opacity-80">
             {milestone.description}
          </p>

          <div className="flex flex-wrap gap-10 items-center">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] tracking-widest uppercase mb-2">ALLOCATED_VALUE</span>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--copper)] shadow-[0_0_8px_var(--copper-glow)]"></div>
                 <span className="text-2xl font-mono font-medium text-[var(--text-primary)] tracking-tighter">
                   {contractHelpers.formatWei(amount)} <span className="text-xs text-[var(--text-muted)] font-bold">ETH</span>
                 </span>
              </div>
            </div>

            {milestone.status === "SUBMITTED" && milestone.submittedAt && (
              <div className="flex flex-col border-l border-[var(--border-subtle)] pl-8">
                 <span className="text-[9px] font-mono font-bold text-[var(--amber)] tracking-widest uppercase mb-2">AUTO_RELEASE_WINDOW</span>
                 <CountdownTimer submittedAt={milestone.submittedAt} />
              </div>
            )}
          </div>
        </div>

        {/* Verification Matrix */}
        {(milestone.githubCommit || milestone.ipfsCID) && (
          <div className="bg-[var(--bg-deep)] p-5 rounded border border-[var(--border-subtle)] flex flex-col gap-4 min-w-[240px] shadow-inner">
            <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] tracking-widest uppercase border-b border-[var(--border-subtle)] pb-2">CRITERIA_VERIFICATION</span>
            
            {milestone.githubCommit && (
              <div className="flex items-center justify-between gap-4">
                 <span className="text-[10px] text-[var(--text-secondary)] font-medium">COMMIT_SHA</span>
                 <span className="text-[10px] font-mono font-bold text-[var(--copper-bright)] bg-[var(--copper-glow)] px-2 py-0.5 rounded border border-[var(--copper)]/20">
                   {milestone.githubCommit.slice(0, 8)}
                 </span>
              </div>
            )}
            
            {milestone.ipfsCID && (
              <div className="flex items-center justify-between gap-4">
                 <span className="text-[10px] text-[var(--text-secondary)] font-medium">IPFS_RECORD</span>
                 <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] opacity-60">
                   {milestone.ipfsCID.slice(0, 10)}...
                 </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Surface */}
      <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          {isClient && milestone.status === "SUBMITTED" && (
            <>
              <button 
                onClick={onApprove}
                className="btn-primary text-[11px] px-10"
              >
                AUTHORIZE_SETTLEMENT
              </button>
              <button 
                onClick={() => onDispute?.()}
                className="btn-danger text-[11px] px-10"
              >
                FLAG_DISPUTE
              </button>
            </>
          )}

          {isFreelancer && milestone.status === "PENDING" && (
            <button 
              onClick={() => onSubmit?.("hash", "github")}
              className="btn-secondary text-[11px] px-10 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-bright)]"
            >
              SHIP_DELIVERABLE
            </button>
          )}
        </div>

        {milestone.status === "RELEASED" && (
          <div className="flex items-center gap-3 bg-[var(--emerald-dim)] px-5 py-2.5 rounded border border-[var(--emerald)]/20 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--emerald)] shadow-[0_0_8px_var(--emerald)]"></div>
            <span className="text-[10px] text-[var(--emerald)] font-mono font-bold tracking-widest uppercase">SETTLED_ON_CHAIN</span>
          </div>
        )}
      </div>
    </div>
  );
}
