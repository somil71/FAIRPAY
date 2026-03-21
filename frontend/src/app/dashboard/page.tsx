"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import AmountDisplay from "@/components/shared/AmountDisplay";
import EscrowFlowAnimation from "@/components/shared/EscrowFlowAnimation";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { formatEther } from "viem";

/**
 * Page: Dashboard
 * Aesthetic: SecureGlow Dark (Trust Blue & Security Green)
 * Strategy: Integrated high-fidelity modules with live data from the store.
 */
export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const { 
    contracts, 
    currentUser, 
    isDemoMode, 
    approveAndRelease, 
    optimizeSettlement,
    fetchContracts,
    txPending 
  } = useAppStore();
  
  const [role, setRole] = useState<"client" | "freelancer">("client");

  // Fetch contracts from the real backend when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchContracts(address);
    }
  }, [isConnected, address, fetchContracts]);

  if (!isConnected) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
         <div className="w-16 h-16 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-4xl opacity-20 text-[var(--primary)]">
            ⊘
         </div>
         <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text-secondary)]">
            Wallet Link Required
         </h2>
         <p className="text-sm font-body text-[var(--text-muted)] max-w-sm">
           Establish a secure wallet link to access your institutional escrow dashboard.
         </p>
      </div>
    );
  }

  // Filter based on role if not in Demo Mode
  // In Demo Mode, highlight the demo contract
  const myContracts = contracts.filter(c => {
    if (isDemoMode && c.id === 'DEMO-001') return true;
    if (role === 'client') return c.client.address === currentUser.address;
    return c.freelancer.address === currentUser.address;
  });

  // Calculate dynamic stats from store
  const totalInEscrow = myContracts.reduce((acc, c) => acc + c.totalAmount, 0n);
  const activeCount = myContracts.filter(c => c.status === 'ACTIVE').length;
  const pendingReviews = myContracts.flatMap(c => c.milestones).filter(m => m.status === 'SUBMITTED').length;
  const releasedTotal = myContracts.flatMap(c => c.milestones).filter(m => m.status === 'RELEASED').reduce((acc, m) => acc + m.amount, 0n);

  return (
    <div className="flex flex-col gap-12">
      {/* 1. Dashboard Header & Role Toggle */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] uppercase tracking-[0.4em] highlight-analytics">
             Analytics
           </span>
           <h1 className="text-5xl font-bold tracking-tighter font-display uppercase">
             {role} Terminal
           </h1>
        </div>
        
        <div className="flex bg-[var(--bg-secondary)] p-1 border border-[var(--border)] rounded-sm">
           <button 
             onClick={() => setRole("client")}
             className={`px-6 py-2 text-[10px] font-mono font-bold tracking-widest transition-all ${role === 'client' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
           >
             Client Mode
           </button>
           <button 
             onClick={() => setRole("freelancer")}
             className={`px-6 py-2 text-[10px] font-mono font-bold tracking-widest transition-all ${role === 'freelancer' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
           >
             Freelancer Mode
           </button>
        </div>
      </header>

      {/* 2. Top Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <div className="card p-6 flex flex-col gap-4 border-b-2 border-b-[var(--primary)]">
           <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Total in Escrow</span>
           <AmountDisplay amount={totalInEscrow} size="lg" type="locked" />
           <div className="text-[9px] font-mono text-[var(--accent)]">+Ξ 0.0 Today // Active Growth</div>
        </div>
        <div className="card p-6 flex flex-col gap-4 border-b-2 border-b-[var(--primary-dark)]">
           <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Active Contracts</span>
           <span className="text-3xl font-mono text-[var(--text-primary)] font-medium">{activeCount.toString().padStart(2, '0')}</span>
           <div className="text-[9px] font-mono text-[var(--warning)]">Tracking Live Node</div>
        </div>
        <div className="card p-6 flex flex-col gap-4 border-b-2 border-b-[var(--danger)]">
           <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Pending Reviews</span>
           <span className="text-3xl font-mono text-[var(--text-primary)] font-medium">{pendingReviews.toString().padStart(2, '0')}</span>
           <div className="text-[9px] font-mono text-[var(--danger)]">Action Required</div>
        </div>
        <div className="card p-6 flex flex-col gap-4 border-b-2 border-b-[var(--accent)]">
           <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Released Total</span>
           <AmountDisplay amount={releasedTotal} size="lg" type="incoming" />
           <div className="text-[9px] font-mono text-[var(--text-muted)]">Settlement History</div>
        </div>
      </section>

      {/* 3. Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left: Active Contracts & Submissions (66%) */}
         <div className="lg:col-span-2 flex flex-col gap-12">
            
            {pendingReviews > 0 && (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-8 py-5 rounded-sm flex items-center justify-between group cursor-pointer hover:bg-[var(--danger)]/20 transition-all submission-inbox">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-[var(--danger)] rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-[var(--danger)] tracking-widest uppercase">
                      Urgent: {pendingReviews} milestone submissions near timeout — Review now to prevent auto-release.
                    </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-10">
               <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-secondary)]">Active Contracts</h2>
                  <Link href="/contracts" className="text-[10px] font-mono font-bold text-[var(--primary-light)] hover:underline uppercase tracking-widest">View History</Link>
               </div>
               
               <div className="flex flex-col gap-8">
                  {myContracts.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-xl opacity-40">
                      <span className="text-[10px] font-mono uppercase tracking-widest">No active contracts found</span>
                    </div>
                  ) : (
                    myContracts.slice(0, 3).map((c, i) => (
                      <div key={c.id} className={`card p-8 border-l-4 border-[var(--primary)] flex flex-col gap-8 relative overflow-hidden group ${isDemoMode && c.id === 'DEMO-001' ? 'demo-spotlight-item' : ''}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-6xl font-bold font-display pointer-events-none">{i+1}</div>
                        
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                             <Link href={`/contracts/${c.id}`} className="text-2xl font-bold text-[var(--text-primary)] hover:text-[var(--primary-light)] transition-colors">
                               {c.title}
                             </Link>
                             <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1 uppercase">ID: {c.id} | Freelancer: {c.freelancer.displayName}</span>
                          </div>
                          <div className="badge badge--active uppercase tracking-tighter italic">Live</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                           <div className="flex flex-col gap-4">
                              <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Contract Stats</span>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] text-[var(--text-muted)]">Value</span>
                                    <span className="text-sm font-mono font-bold">Ξ {formatEther(c.totalAmount)}</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] text-[var(--text-muted)]">Resolved</span>
                                    <span className="text-sm font-mono font-bold">
                                      {c.milestones.filter(m => m.status === 'RELEASED').length} / {c.milestones.length}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col gap-4">
                                <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Latest Submission</span>
                                <div className="bg-[var(--bg-secondary)] p-6 rounded-sm border border-[var(--border)] flex flex-col gap-4">
                                   <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">Status:</span>
                                      <span className={`text-[10px] font-mono font-bold ${c.milestones.some(m => m.status === 'SUBMITTED') ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
                                        {c.milestones.some(m => m.status === 'SUBMITTED') ? 'Pending Review' : 'Idle'}
                                      </span>
                                   </div>
                                   <div className="h-[1px] bg-[var(--border)]" />
                                   <Link href={`/contracts/${c.id}`} className="btn-secondary w-full py-2.5 text-[9px] mt-2 block text-center uppercase tracking-widest">Manage →</Link>
                                </div>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>

         {/* Right Column */}
         <aside className="flex flex-col gap-12">
            <EscrowFlowAnimation />
            
            <div className="card p-6 border-l border-[var(--primary-dark)]/40 flex flex-col gap-6">
               <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] border-b border-[var(--border)] pb-2">
                  Settlement History
               </h3>
               {myContracts.filter(c => c.status === 'COMPLETED').length === 0 ? (
                 <div className="py-8 text-center opacity-30 text-[9px] font-mono">No history</div>
               ) : (
                 myContracts.filter(c => c.status === 'COMPLETED').map((h, i) => (
                   <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-[var(--bg-secondary)] p-2 -mx-2 transition-colors">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-[var(--text-primary)]">{h.title}</span>
                         <span className="text-[8px] font-mono text-[var(--text-muted)] tracking-tighter uppercase">Completed</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-[var(--accent)]">Ξ {formatEther(h.totalAmount)}</span>
                   </div>
                 ))
               )}
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-sm flex flex-col items-center text-center gap-6 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
               <h4 className="text-lg font-bold font-display tracking-tight text-[var(--text-primary)]">Optimize Settlement</h4>
               <p className="text-[10px] font-body text-[var(--text-secondary)] opacity-60 leading-relaxed px-4">
                 Enable low-gas aggregation for multi-milestone releases.
               </p>
               <button 
                 onClick={optimizeSettlement}
                 disabled={txPending}
                 className="btn-accent w-full py-3 text-[9px] font-bold tracking-[0.2em] uppercase disabled:opacity-50"
               >
                 {txPending ? "Optimizing..." : "Optimize"}
               </button>
            </div>
         </aside>
      </div>
    </div>
  );
}
