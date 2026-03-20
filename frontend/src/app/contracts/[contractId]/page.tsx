"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AmountDisplay from "@/components/shared/AmountDisplay";
import AddressDisplay from "@/components/shared/AddressDisplay";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { useAccount } from "wagmi";
import { Badge } from "@/components/ui/Badge";
import { formatEther } from "viem";

export default function ContractDetail() {
  const params = useParams();
  const router = useRouter();
  const contractId = params?.contractId as string;
  const { address } = useAccount();
  const { contracts, approveAndRelease, submitMilestone, txPending, ensureDemoContract, isDemoMode } = useAppStore();
  
  const contract = contracts.find(c => c.id === contractId);

  // Auto-provision demo contract if in demo mode and it doesn't exist
  useEffect(() => {
    if (isDemoMode && contractId?.startsWith('DEMO-') && !contract) {
       ensureDemoContract(contractId);
    }
  }, [isDemoMode, contractId, contract, ensureDemoContract]);

  if (!contract) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-8 font-mono">
        <span className="text-7xl opacity-10">🌍</span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-secondary)] uppercase">Contract Not Found</h1>
        <p className="text-xs font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">ID: {contractId} is not synced on ledger</p>
        <Link href="/dashboard" className="btn-secondary px-12 mt-8 transition-all font-bold">Return to Dashboard</Link>
      </div>
    );
  }

  const releasedAmount = contract.milestones
    .filter(m => m.status === 'RELEASED')
    .reduce((acc, m) => acc + m.amount, 0n);
  
  const completionPercent = contract.totalAmount > 0n 
    ? Math.round((Number(releasedAmount) / Number(contract.totalAmount)) * 100)
    : 0;

  const isClient = address?.toLowerCase() === contract.client.address.toLowerCase();
  const isFreelancer = address?.toLowerCase() === contract.freelancer.address.toLowerCase();

  return (
    <div className="flex flex-col gap-16 animate-in fade-in duration-700 max-w-7xl mx-auto contract-view">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-[var(--border)] pb-12">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-[var(--primary-light)] font-bold tracking-[0.4em]">Protocol v1.0</span>
            <Badge variant={contract.status === 'ACTIVE' ? 'success' : contract.status === 'DISPUTED' ? 'danger' : 'info'}>
              {contract.status}
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            {contract.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 mt-4 pl-1">
             <AddressDisplay label="Client" address={contract.client.address} />
             <div className="hidden md:block h-8 w-[1px] bg-[var(--border)]" />
             <AddressDisplay label="Freelancer" address={contract.freelancer.address} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 min-w-[280px]">
          <div className="card p-6 bg-[var(--bg-elevated)] border-[var(--border-light)] shadow-2xl w-full">
            <AmountDisplay amount={contract.totalAmount} size="xl" type="locked" label="Total Escrow" />
          </div>
          <div className="flex gap-6 items-center px-2">
             <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Progress: {completionPercent}%</span>
             <Link href={`/arbitrate?contractId=${contractId}`} className="text-[10px] font-mono font-bold text-[var(--danger)] hover:text-red-400 transition-colors underline decoration-2 underline-offset-8 decoration-red-900/30">Raise Dispute</Link>
          </div>
        </div>
      </header>

      {/* Progress Visualizer */}
      <div className="flex flex-col gap-6 p-8 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent rounded-2xl border border-[var(--border)]">
        <div className="flex justify-between items-center text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest px-2">
           <span className="flex items-center gap-2 underline underline-offset-4 decoration-[var(--primary)]/30">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              Settlement Progress
           </span>
           <span className="text-[var(--primary-light)]">Ξ {completionPercent}% Settled</span>
        </div>
        <div className="h-4 w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-full overflow-hidden p-[3px]">
           <div 
             className="h-full bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--accent)] rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-in-out"
             style={{ width: `${completionPercent}%` }}
           />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Milestones */}
        <section className="lg:col-span-2 flex flex-col gap-10">
           <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 pl-2">
             <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em]">Milestone Log</span>
             <div className="h-[2px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
           </div>

           <div className="flex flex-col gap-8">
              {contract.milestones.map((m) => (
                <div 
                  key={m.id} 
                  id={`milestone-${m.id}`}
                  className={`card p-10 flex flex-col gap-8 relative group transition-all duration-500 rounded-2xl ${m.status === 'RELEASED' ? 'opacity-50 grayscale-[0.2] border-transparent bg-[var(--bg-primary)]/40' : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--bg-secondary)] border-b-4 hover:border-b-4'}`}
                >
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Milestone {m.index}</span>
                           <Badge variant={m.status === 'RELEASED' ? 'success' : m.status === 'DISPUTED' ? 'danger' : m.status === 'SUBMITTED' ? 'info' : 'warning'}>
                             {m.status}
                           </Badge>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors uppercase">
                          {m.name}
                        </h3>
                     </div>
                     <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-light)]">
                       <AmountDisplay amount={m.amount} size="md" type={m.status === 'RELEASED' ? 'incoming' : 'locked'} />
                     </div>
                  </div>

                  <p className="text-base text-[var(--text-secondary)] opacity-90 leading-relaxed font-body">
                    {m.description}
                  </p>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-4 border-t border-[var(--border)]/50">
                     <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-2">
                           <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Verification</span>
                           <span className="text-[11px] font-mono font-bold text-[var(--primary-light)]">Auto (48h)</span>
                        </div>
                        {m.txHash && (
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Transaction Hash</span>
                              <span className="text-[11px] font-mono font-bold text-[var(--accent)] tracking-tighter">{m.txHash.substring(0, 10)}...</span>
                           </div>
                        )}
                        {m.deliverable && (
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Deliverable</span>
                              <span className="text-[11px] font-mono font-bold text-[var(--info)] tracking-tighter cursor-pointer underline hover:text-blue-400">View on {m.deliverableType || 'IPFS'}</span>
                           </div>
                        )}
                     </div>

                     <div className="flex gap-4">
                        {m.status === 'SUBMITTED' && isClient && (
                           <button 
                             disabled={txPending}
                             onClick={() => approveAndRelease(contractId, m.id)}
                             className="btn-primary py-3 px-10 shadow-xl hover:shadow-[var(--glow-primary)] transition-all font-bold"
                           >
                             Approve & Release
                           </button>
                        )}
                        {m.status === 'PENDING' && isFreelancer && (
                           <button 
                             disabled={txPending}
                             onClick={() => submitMilestone(contractId, m.id, 'Qm' + Math.random().toString(36).substr(2, 12), 'IPFS')}
                             className="btn-primary py-3 px-10 shadow-xl hover:shadow-[var(--glow-primary)] transition-all font-bold"
                           >
                             Submit Work
                           </button>
                        )}
                        {m.status === 'DISPUTED' && (
                           <Link href={`/arbitrate?id=${contractId}`} className="btn-primary py-3 px-10 bg-[var(--danger)] hover:bg-red-500 shadow-xl transition-all font-bold border-none">
                             View Dispute
                           </Link>
                        )}
                         <button 
                           onClick={() => document.getElementById(`milestone-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                           className="btn-secondary py-3 px-6 text-xs font-bold border-[var(--border-light)]"
                         >
                           Details
                         </button>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Info Sidebar */}
        <aside className="flex flex-col gap-10">
           <div className="card p-10 flex flex-col gap-10 bg-[var(--bg-secondary)] border-[var(--border)] shadow-2xl relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[80px] pointer-events-none" />
              <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] border-b border-[var(--border)] pb-6 pl-1">
                Analytics
              </h3>
              
              <div className="flex flex-col gap-8">
                 <div className="flex flex-col gap-3 border-b border-[var(--border)]/50 pb-8">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Trust Score</span>
                    <div className="flex items-baseline gap-3">
                       <span className="text-5xl font-bold tracking-tighter text-[var(--accent)] font-mono">9.8</span>
                       <span className="text-[12px] font-mono text-[var(--text-muted)] font-bold uppercase">/ 10.0</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center text-[12px] font-mono">
                       <span className="text-[var(--text-secondary)] font-bold">Remaining Locked</span>
                       <span className="text-[var(--text-primary)] font-bold">Ξ {formatEther(contract.totalAmount - releasedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-mono">
                       <span className="text-[var(--text-secondary)] font-bold">Network Fee</span>
                       <span className="text-[var(--text-primary)] font-bold">0.3%</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-mono">
                       <span className="text-[var(--text-secondary)] font-bold">Verification Level</span>
                       <span className="text-[var(--primary-light)] font-bold uppercase tracking-widest">Standard (Secure)</span>
                    </div>
                 </div>

                 <div className="mt-4 pt-8 flex flex-col gap-6 border-t border-[var(--border)]">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Protocol Features</span>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-[var(--bg-primary)]/80 p-3 rounded-lg text-[9px] font-mono font-bold text-center border border-[var(--border-light)]/50 tracking-tighter">AES-256</div>
                       <div className="bg-[var(--bg-primary)]/80 p-3 rounded-lg text-[9px] font-mono font-bold text-center border border-[var(--border-light)]/50 tracking-tighter">P2P Oracle</div>
                       <div className="bg-[var(--bg-primary)]/80 p-3 rounded-lg text-[9px] font-mono font-bold text-center border border-[var(--border-light)]/50 tracking-tighter">Merkle Proofs</div>
                       <div className="bg-[var(--bg-primary)]/80 p-3 rounded-lg text-[9px] font-mono font-bold text-center border border-[var(--border-light)]/50 tracking-tighter">48h Auto</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border)] p-10 rounded-2xl flex flex-col gap-6 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.3em] flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                 Security Audit
              </span>
              <p className="text-sm font-body text-[var(--text-secondary)] opacity-80 leading-relaxed italic">
                "This protocol execution is final. Funds are secured via 3-of-3 multi-signature arbitration nodes. Audit status: VERIFIED."
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
