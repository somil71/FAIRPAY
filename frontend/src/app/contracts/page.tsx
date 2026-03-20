"use client";
import React, { useState } from "react";
import AmountDisplay from "@/components/shared/AmountDisplay";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";

const MOCK_CONTRACTS = [
  { id: "7421", title: "TechCorp_UI_Sprint_01", freelancer: "0x3f4a...8b2c", amount: 4500000000000000000n, status: "ACTIVE", milestones: 7, completed: 4 },
  { id: "7422", title: "Smart_Contract_Audit_v2", freelancer: "0x1a2b...c3d4", amount: 12000000000000000000n, status: "DISPUTED", milestones: 3, completed: 1 },
  { id: "7423", title: "Content_Strategy_Q3", freelancer: "0x9e8f...a7b6", amount: 2100000000000000000n, status: "RELEASED", milestones: 5, completed: 5 },
  { id: "7424", title: "Backend_API_Refactor", freelancer: "0x5c4d...e2f1", amount: 3000000000000000000n, status: "PENDING", milestones: 10, completed: 0 },
];

/**
 * Page: Contracts Ledger
 * Aesthetic: Oxidized Copper · Financial Noir
 * Purpose: Categorized browsing of all platform interactions.
 */
export default function ContractsLedger() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONTRACTS.filter(c => {
    const matchesFilter = filter === "ALL" || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        {filtered.map((c) => (
          <div key={c.id} className="card p-10 group hover:border-[var(--primary)]/40 transition-all flex flex-col md:flex-row gap-12 items-start md:items-center bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-xl relative overflow-hidden">
            <div className="flex flex-col gap-2 min-w-[320px]">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">ID: {c.id}</span>
                  <div className={`w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent)]' : 'bg-[var(--text-muted)] opacity-30'}`} />
               </div>
               <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors uppercase">
                 {c.title.replace(/_/g, " ")}
               </h3>
               <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest opacity-60">FREELANCER: <span className="text-[var(--text-muted)] font-bold ml-1">{c.freelancer}</span></span>
            </div>

            <div className="h-16 w-[1px] bg-[var(--border)] hidden md:block opacity-40" />

            <div className="flex flex-col gap-3 flex-1">
               <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  <span>Settlement Progress</span>
                  <span className="text-[var(--primary-light)]">{Math.round((c.completed / c.milestones) * 100)}%</span>
               </div>
               <div className="flex gap-1.5 h-2 w-full">
                  {[...Array(c.milestones)].map((_, i) => (
                     <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < c.completed ? 'bg-[var(--accent)] shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'}`} />
                  ))}
               </div>
               <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 uppercase text-right font-bold tracking-tighter opacity-60">
                 {c.completed} OF {c.milestones} MILESTONES RESOLVED
               </span>
            </div>

            <div className="h-16 w-[1px] bg-[var(--border)] hidden md:block opacity-40" />

            <div className="min-w-[160px] flex flex-col items-end gap-3">
               <AmountDisplay amount={c.amount} size="lg" type={c.status === 'RELEASED' ? 'incoming' : 'locked'} />
               <div className="badge badge--submitted text-[9px] bg-transparent border-[var(--border)] px-4 py-1.5 rounded-lg opacity-60 font-mono tracking-widest uppercase">
                 Secure Escrow v1
               </div>
            </div>

            <div className="flex md:flex-col gap-4 w-full md:w-auto">
               <Link href={`/contracts/${c.id}`} className="btn-primary text-[10px] text-center w-full md:w-36 py-3 uppercase font-bold tracking-widest shadow-md">Open Contract</Link>
               <button className="btn-secondary text-[10px] w-full md:w-36 py-3 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase font-bold tracking-widest">Export CSV</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="h-80 flex flex-col items-center justify-center text-center gap-6 opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
             <span className="text-6xl">📡</span>
             <p className="text-xl font-bold tracking-tight text-[var(--text-muted)] uppercase">No records found for this query</p>
          </div>
        )}
      </section>
    </div>
  );
}
