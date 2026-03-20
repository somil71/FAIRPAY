"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Component: ReputationMinter
 * Purpose: Live preview of the Soulbound Reputation NFT minted upon milestone completion.
 */
export default function ReputationMinter({ milestoneTitle = "UI_Architecture_Sprint" }) {
  const [isMinting, setIsMinting] = useState(false);

  return (
    <div className="card p-8 bg-[var(--bg-base)] border-[var(--border-subtle)] flex flex-col gap-8 relative overflow-hidden group">
      <div className="flex flex-col gap-2 relative z-10 text-left">
         <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.4em]">Soulbound Proof Preview</span>
         <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)]">Reputation Credential</h3>
      </div>

      {/* NFT Card Preview */}
      <div className="relative aspect-square w-full max-w-[280px] mx-auto group-hover:scale-[1.02] transition-transform duration-500">
         <div className="absolute inset-0 bg-[var(--bg-deep)] border-2 border-[var(--primary)]/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="absolute top-5 left-6 text-[8px] font-mono text-[var(--primary-light)] font-bold tracking-widest uppercase">Protocol v1.0</div>
            <div className="absolute top-5 right-6 text-[8px] font-mono text-[var(--primary-light)] font-bold tracking-widest uppercase">Secure</div>
            
            {/* Holographic effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-glow)]/10 via-transparent to-[var(--accent-dim)]/10 opacity-40 mix-blend-overlay" />
            
            <div className="w-24 h-24 border border-[var(--primary)]/40 relative flex items-center justify-center mb-6 rounded-3xl">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border border-[var(--primary)]/10 border-t-[var(--primary)]/60 rounded-full"
               />
               <span className="text-4xl font-display font-bold text-[var(--primary-light)] shadow-[0_0_10px_rgba(59,130,246,0.3)]">FP</span>
            </div>
            
            <h4 className="text-lg font-bold font-display tracking-tight text-[var(--text-primary)] mb-2 uppercase italic">{milestoneTitle.replace(/_/g, " ")}</h4>
            <div className="h-[1px] w-12 bg-[var(--primary)]/30 mb-3" />
            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-[0.3em] uppercase font-bold">Verified Contribution</span>
            
            <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
               <span>Issuance: 2026.03.21</span>
               <span>Soulbound</span>
            </div>
         </div>
      </div>

      <div className="flex flex-col gap-5 relative z-10">
         <p className="text-[10px] font-body text-[var(--text-secondary)] opacity-60 leading-relaxed text-center italic px-4">
           "Proof of settlement history is the only portable trust in a decentralized workforce."
         </p>
         <button 
           onClick={() => { setIsMinting(true); setTimeout(() => setIsMinting(false), 2000); }}
           className="btn-primary w-full py-3 text-[10px] font-bold tracking-[0.2em] shadow-lg"
         >
           {isMinting ? "Recording Proof..." : "Simulate Mint"}
         </button>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute right-0 bottom-0 p-4 opacity-5 pointer-events-none select-none text-[80px] font-mono font-bold">
        MINT
      </div>
    </div>
  );
}
