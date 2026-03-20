"use client";
import React from "react";
import { motion } from "framer-motion";

/**
 * Component: EscrowFlowAnimation
 * Aesthetic: Oxidized Copper · Financial Noir
 * Purpose: High-fidelity visualization of the trustless movement of funds.
 */
export default function EscrowFlowAnimation() {
  return (
    <div className="card p-12 bg-[var(--bg-secondary)] border-[var(--border)] overflow-hidden relative rounded-3xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-16 relative z-10 text-left">
         <span className="text-[10px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.4em]">
           Protocol Visualization
         </span>
         <h2 className="text-4xl font-bold font-display tracking-tight leading-none text-[var(--text-primary)] uppercase">
           Live Settlement Cycle
         </h2>
      </div>

      <div className="relative h-64 flex items-center justify-between gap-4 px-12 z-10">
        {/* Node: CLIENT */}
        <div className="flex flex-col items-center gap-5 w-24">
           <div className="w-20 h-20 rounded-2xl border-2 border-[var(--primary)] flex items-center justify-center bg-[var(--bg-primary)] shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <span className="text-3xl opacity-80">👤</span>
           </div>
           <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase">Client</span>
        </div>

        {/* Path 1: Funding */}
        <div className="flex-1 h-[2px] bg-[var(--border)] relative">
           <motion.div 
             animate={{ x: [0, 180], opacity: [0, 1, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]"
           />
           <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--primary-light)] font-bold uppercase tracking-widest whitespace-nowrap">Initial Funding (Ξ 2.5)</div>
        </div>

        {/* Node: PROTOCOL ESCROW */}
        <div className="flex flex-col items-center gap-5 w-32 translate-y-[-10px]">
           <motion.div 
             animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(59,130,246,0.05)", "0 0 40px rgba(59,130,246,0.1)", "0 0 20px rgba(59,130,246,0.05)"] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="w-24 h-24 border-2 border-[var(--primary-light)] bg-[var(--bg-primary)] rounded-3xl flex items-center justify-center relative shadow-inner"
           >
              <div className="text-4xl">🔒</div>
              {/* Spinning Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-12px] border border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full"
              />
           </motion.div>
           <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] tracking-[0.2em] uppercase">Secure Escrow</span>
        </div>

        {/* Path 2: Release */}
        <div className="flex-1 h-[2px] bg-[var(--border)] relative">
           <motion.div 
             animate={{ x: [0, 180], opacity: [0, 1, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
             className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
           />
           <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--accent)] font-bold uppercase tracking-widest whitespace-nowrap">Auto Settlement (48h)</div>
        </div>

        {/* Node: FREELANCER */}
        <div className="flex flex-col items-center gap-5 w-24">
           <div className="w-20 h-20 rounded-2xl border-2 border-[var(--accent)] flex items-center justify-center bg-[var(--bg-primary)] shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <span className="text-3xl opacity-80">💻</span>
           </div>
           <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase">Freelancer</span>
        </div>
      </div>

      <div className="mt-16 pt-10 border-t border-[var(--border)] flex justify-between items-center relative z-10 font-bold">
         <div className="flex flex-col gap-2 text-left">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Verification Method</span>
            <span className="text-sm font-mono text-[var(--primary-light)] uppercase tracking-wider">GitHub Commit Sync</span>
         </div>
         <div className="flex flex-col gap-2 text-right">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Settlement Status</span>
            <span className="text-sm font-mono text-[var(--accent)] uppercase tracking-wider">Verified On-Chain</span>
         </div>
      </div>
    </div>
  );
}
