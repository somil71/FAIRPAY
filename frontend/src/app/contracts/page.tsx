"use client";
import React, { useState, useEffect, useCallback } from "react";
import AmountDisplay from "@/components/shared/AmountDisplay";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAccount } from "wagmi";
import { fromWeiString } from "@/lib/bigintUtils";
import { Badge } from "@/components/ui/Badge";

interface ApiContract {
  id:                string;
  clientAddress:     string;
  freelancerAddress: string;
  totalAmount:       string;
  status:            string;
  createdAt:         string;
  milestones:        { id: number; title: string; status: string; paymentBps: number }[];
}

export default function ContractsLedger() {
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  const fetchContracts = useCallback(async () => {
    if (!address) {
      setContracts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ApiContract[]>(`/api/contracts/party/${address}`);
      setContracts(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        console.warn('[ContractsLedger] Backend unreachable');
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const filtered = contracts.filter(c => {
    const matchesFilter = filter === "ALL" || c.status.toUpperCase() === filter;
    const matchesSearch = !search || c.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isConnected) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-8 font-mono">
        <span className="text-7xl opacity-10">🔐</span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-secondary)] uppercase">Protocol Registry</h1>
        <p className="text-xs font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Connect wallet to view your contracts</p>
        <Link href="/profile" className="btn-primary px-12 mt-4 transition-all font-bold">Connect Wallet</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] uppercase tracking-[0.4em]">
             Ledger Archive v1.0
           </span>
           <h1 className="text-5xl font-bold tracking-tighter font-display uppercase text-[var(--text-primary)]">
             Protocol Registry
           </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <input 
             type="text"
             placeholder="Search contracts..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-[var(--bg-secondary)] border border-[var(--border)] px-5 py-3 text-sm font-body rounded-xl outline-none focus:border-[var(--primary-light)] transition-all min-w-[300px] shadow-inner"
           />
           <Link href="/create" className="btn-primary text-[10px] py-3 px-10 uppercase font-bold tracking-widest shadow-lg">New Contract</Link>
        </div>
      </header>

      {/* Filter Tabs */}
      <nav className="flex gap-10 border-b border-[var(--border)] pb-4 overflow-x-auto custom-scrollbar">
        {["ALL", "ACTIVE", "PENDING", "RELEASED", "DISPUTED"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-[11px] font-mono font-bold tracking-[0.2em] transition-all whitespace-nowrap pb-4 -mb-[18px] ${filter === tab ? 'text-[var(--primary-light)] border-b-2 border-[var(--primary-light)] opacity-100' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] opacity-60'}`}
          >
            {tab} RECORDS
          </button>
        ))}
      </nav>

      {/* Ledger Grid */}
      <section className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-6 opacity-50">
            <span className="text-xl animate-pulse">Loading contracts...</span>
          </div>
        ) : error ? (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-6 opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
             <span className="text-6xl">⚠️</span>
             <p className="text-xl font-bold tracking-tight text-[var(--text-muted)] uppercase">Failed to load contracts</p>
             <p className="text-sm text-[var(--text-muted)]">{error}</p>
             <button onClick={fetchContracts} className="btn-secondary px-8 py-2">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-6 opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
             <span className="text-6xl">📡</span>
             <p className="text-xl font-bold tracking-tight text-[var(--text-muted)] uppercase">
               {contracts.length === 0 ? 'No contracts yet' : 'No records found for this query'}
             </p>
             {contracts.length === 0 && (
               <Link href="/create" className="btn-primary px-8 py-2 mt-4">Create Your First Contract</Link>
             )}
          </div>
        ) : (
          filtered.map((c) => {
            const completedCount = c.milestones.filter(m => m.status === 'Released' || m.status === 'RELEASED').length;
            const totalMilestones = c.milestones.length;
            const pct = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

            return (
              <div key={c.id} className="card p-10 group hover:border-[var(--primary)]/40 transition-all flex flex-col md:flex-row gap-12 items-start md:items-center bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-xl relative overflow-hidden">
                <div className="flex flex-col gap-2 min-w-[320px]">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">ID: {c.id.slice(0, 8)}</span>
                      <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Disputed' ? 'danger' : 'info'}>
                        {c.status}
                      </Badge>
                   </div>
                   <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors uppercase">
                     Contract {c.id.slice(0, 8)}
                   </h3>
                   <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
                     FREELANCER: <span className="text-[var(--text-muted)] font-bold ml-1">{c.freelancerAddress.slice(0, 6)}...{c.freelancerAddress.slice(-4)}</span>
                   </span>
                </div>

                <div className="h-16 w-[1px] bg-[var(--border)] hidden md:block opacity-40" />

                <div className="flex flex-col gap-3 flex-1">
                   <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                      <span>Settlement Progress</span>
                      <span className="text-[var(--primary-light)]">{pct}%</span>
                   </div>
                   <div className="flex gap-1.5 h-2 w-full">
                      {c.milestones.map((m, i) => (
                         <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${m.status === 'Released' || m.status === 'RELEASED' ? 'bg-[var(--accent)] shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'}`} />
                      ))}
                   </div>
                   <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 uppercase text-right font-bold tracking-tighter opacity-60">
                     {completedCount} OF {totalMilestones} MILESTONES RESOLVED
                   </span>
                </div>

                <div className="h-16 w-[1px] bg-[var(--border)] hidden md:block opacity-40" />

                <div className="min-w-[160px] flex flex-col items-end gap-3">
                   <AmountDisplay amount={fromWeiString(c.totalAmount)} size="lg" type={c.status === 'Released' ? 'incoming' : 'locked'} />
                </div>

                <div className="flex md:flex-col gap-4 w-full md:w-auto">
                   <Link href={`/contracts/${c.id}`} className="btn-primary text-[10px] text-center w-full md:w-36 py-3 uppercase font-bold tracking-widest shadow-md">Open Contract</Link>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
