"use client";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import AddressDisplay from "@/components/shared/AddressDisplay";
import AmountDisplay from "@/components/shared/AmountDisplay";

const MOCK_NFTS = [
  { id: "REP-001", title: "SOLIDITY_MASTER", date: "2026.03.15", contract: "FairPay_Core_v1", tier: "GOLD" },
  { id: "REP-002", title: "UI_ARCHITECTURE", date: "2026.03.10", contract: "TechCorp_Dashboard", tier: "SILVER" },
  { id: "REP-003", title: "DESIGN_SYSTEMS", date: "2026.02.28", contract: "Noir_UI_Kit", tier: "BRONZE" },
];

/**
 * Page: Profile (Identity & Reputation)
 * Aesthetic: Oxidized Copper · Financial Noir
 * Purpose: On-chain resume and portable trust gallery.
 */
export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
         <div className="w-16 h-16 rounded-sm bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-4xl opacity-20">
            ○
         </div>
         <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text-secondary)]">
            IDENTITY_LINK_REQUIRED
         </h2>
         <p className="text-sm font-body text-[var(--text-muted)] max-w-sm">
           Your reputation gallery is tied to your Ethereum identity. Link your wallet to view your portable resume.
         </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="flex flex-col gap-4">
           <span className="text-[10px] font-mono font-bold text-[var(--copper)] uppercase tracking-[0.4em]">
             IDENTITY_ORIGIN_v1.0
           </span>
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-sm border-2 border-[var(--copper)] bg-[var(--bg-base)] flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-[var(--copper-dim)] to-[var(--void)] opacity-40" />
                 <span className="text-4xl relative z-10 font-bold font-display text-[var(--copper-bright)]">FP</span>
              </div>
              <div className="flex flex-col gap-2">
                 <h1 className="text-4xl font-bold tracking-tighter font-display uppercase">
                   ANONYMOUS_ENTITY
                 </h1>
                 <AddressDisplay address={address || "0x0"} copyable />
              </div>
           </div>
        </div>

        <div className="flex gap-12 border-l border-[var(--border-subtle)] pl-12 h-fit">
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none mb-1">GLOBAL_RANK</span>
              <span className="text-2xl font-mono font-medium text-[var(--copper)]">TOP_1%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none mb-1">TRUST_SCORE</span>
              <span className="text-2xl font-mono font-medium text-[var(--emerald)]">985/1000</span>
           </div>
        </div>
      </header>

      {/* Reputation Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left: Soulbound Reputation Gallery (66%) */}
         <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
               <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-secondary)]">SOULBOUND_COLLECTION</h2>
               <button className="text-[10px] font-mono font-bold text-[var(--copper)] hover:underline uppercase tracking-widest">QUERY_CONTRACT_HISTORY</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {MOCK_NFTS.map((nft) => (
                 <div key={nft.id} className="card p-0 flex flex-col group overflow-hidden border-2 border-[var(--border-subtle)] hover:border-[var(--copper)] transition-all">
                    {/* Multi-tier specific header */}
                    <div className={`h-40 relative flex items-center justify-center bg-[var(--bg-deep)] overflow-hidden border-b border-[var(--border-subtle)]`}>
                       <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none text-[80px] font-bold font-mono overflow-hidden">
                          {nft.title}
                       </div>
                       <div className="w-16 h-16 border-2 border-[var(--copper)] rotate-45 flex items-center justify-center bg-[var(--void)] relative z-10 group-hover:scale-110 transition-transform">
                          <span className="-rotate-45 text-2xl font-mono font-bold text-[var(--copper-bright)]">{nft.title[0]}</span>
                       </div>
                    </div>
                    
                    <div className="p-6 flex flex-col gap-4">
                       <span className="text-[9px] font-mono font-bold text-[var(--copper)] uppercase tracking-widest">TIER: {nft.tier}</span>
                       <h3 className="text-lg font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{nft.title.replace(/_/g, " ")}</h3>
                       <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase">ORIGIN_CONTRACT</span>
                          <span className="text-[10px] font-body text-[var(--text-secondary)]">{nft.contract}</span>
                       </div>
                       <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                          <span className="text-[8px] font-mono text-[var(--text-muted)]">MINTED: {nft.date}</span>
                          <span className="text-[9px] font-mono font-bold text-[var(--copper)] cursor-pointer">VERIFY_ON_EXPLORER →</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Right: Portfolio Statistics (33%) */}
         <aside className="flex flex-col gap-12">
            <div className="card p-6 flex flex-col gap-8">
               <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] border-b border-[var(--border-subtle)] pb-2">
                  SETTLEMENT_STATS
               </h3>
               
               <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                     <AmountDisplay amount={48200000000000000000n} size="lg" type="incoming" label="TOTAL_PROTOCOL_VOLUME" />
                  </div>
                  <div className="flex flex-col gap-4 h-32 justify-end">
                     <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase mb-2">30_DAY_ACTIVITY_INDEX</span>
                     <div className="flex items-end gap-1.5 h-full">
                        {[12, 24, 8, 45, 12, 18, 32, 14, 25, 60, 10, 24].map((h, i) => (
                           <div key={i} className="flex-1 bg-[var(--copper-dim)] group-hover:bg-[var(--copper)] transition-all hover:brightness-125" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Resume Export Card */}
            <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] p-8 rounded-sm flex flex-col items-center text-center gap-6 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--copper)]" />
               <span className="text-2xl">⎙</span>
               <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold font-display tracking-tight text-[var(--text-primary)]">Export_On-chain_Resume</h4>
                  <p className="text-[10px] font-body text-[var(--text-secondary)] opacity-60 leading-relaxed px-4">
                    Generate a cryptographic proof of your complete settlement history and reputation scores.
                  </p>
               </div>
               <button className="btn-secondary w-full py-3 text-[9px] font-bold tracking-[0.2em] group-hover:bg-[var(--copper)] group-hover:text-[var(--void)] transition-all">
                 DOWNLOAD_PDF_MANIFEST
               </button>
            </div>
         </aside>
      </section>
    </div>
  );
}
