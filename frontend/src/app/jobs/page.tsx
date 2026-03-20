"use client";
import React, { useState } from "react";
import Link from "next/link";
import AmountDisplay from "@/components/shared/AmountDisplay";

interface Job {
  id: string;
  title: string;
  client: string;
  amount: bigint;
  category: string;
  tags: string[];
  description: string;
  deadline: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: "J001",
    title: "Full-Stack_dApp_Architecture",
    client: "0x35d4...1D44",
    amount: 12000000000000000000n, // 12 ETH
    category: "DEVELOPMENT",
    tags: ["REACT", "SOLIDITY", "NEXT.JS"],
    description: "Architect and implement a high-performance escrow dashboard with real-time on-chain event listeners. Must follow Financial Noir guidelines.",
    deadline: "2026-04-15",
  },
  {
    id: "J002",
    title: "Smart_Contract_Audit_v2",
    client: "0x8e2a...9f10",
    amount: 5000000000000000000n, // 5 ETH
    category: "SECURITY",
    tags: ["AUDIT", "SLITHER", "SECURITY"],
    description: "Security audit for the FairPay Escrow Protocol. Focus on re-entrancy, cross-contract calls, and gas optimizations.",
    deadline: "2026-03-30",
  },
  {
    id: "J003",
    title: "UI_UX_Sprint_Marketing",
    client: "0x2b3c...4d5e",
    amount: 2500000000000000000n, // 2.5 ETH
    category: "DESIGN",
    tags: ["FIGMA", "MOTION", "LANDING"],
    description: "High-fidelity landing page design for a decentralized justice module. Theme: SecureGlow Dark.",
    deadline: "2026-04-05",
  },
];

export default function JobBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredJobs = MOCK_JOBS.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || j.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-16 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header & Search */}
      <header className="flex flex-col gap-10 border-b border-[var(--border)] pb-12">
        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.5em]">Job Board v2.0</span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">Open Opportunities</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
               <span className="text-xl">🔍</span>
             </div>
             <input
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by role, tag, or protocol node..."
               className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] p-5 pl-14 rounded-2xl text-base focus:border-[var(--primary-light)] outline-none transition-all shadow-lg"
             />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {["ALL", "DEVELOPMENT", "DESIGN", "SECURITY", "LEGAL"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-5 rounded-2xl font-bold text-xs tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-[var(--primary)] text-white border-transparent shadow-xl' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((j) => (
            <div key={j.id} className="card p-10 flex flex-col gap-8 relative overflow-hidden group hover:border-[var(--primary)] transition-all bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--primary)]/20 uppercase">
                  {j.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase">Job ID: {j.id}</span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors leading-tight uppercase">
                  {j.title.replace(/_/g, " ")}
                </h3>
                <p className="text-base text-[var(--text-secondary)] opacity-80 leading-relaxed line-clamp-3 font-body">
                  {j.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {j.tags.map(t => (
                  <span key={t} className="text-[9px] font-mono font-bold text-[var(--text-muted)] border border-[var(--border)] px-4 py-1.5 rounded-full uppercase group-hover:border-[var(--primary)]/30 transition-colors">
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-8 mt-auto border-t border-[var(--border)]/50 flex flex-col gap-6">
                 <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest pl-1">PROTOCOL_OFFER</span>
                       <AmountDisplay amount={j.amount} size="lg" type="locked" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">DEADLINE</span>
                       <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase">
                         {new Date(j.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                       </span>
                    </div>
                 </div>
                 <Link href={`/jobs/${j.id}`} className="btn-primary w-full py-4 text-center font-bold tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 uppercase">
                    <span>Submit Proposal</span>
                    <span className="text-xl">→</span>
                 </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-80 flex flex-col items-center justify-center text-center gap-6 opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
             <span className="text-6xl">📡</span>
             <h3 className="text-2xl font-bold tracking-tight text-[var(--text-muted)] uppercase">NO_OPPORTUNITIES_SYNCED_FOR_QUERY</h3>
          </div>
        )}
      </section>

      {/* Protocol Notice */}
      <aside className="mt-12 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border)] p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-12 group shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        <div className="flex flex-col gap-4 relative z-10">
           <span className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.4em]">Verified Status</span>
           <h3 className="text-3xl font-bold tracking-tight">Become a Verified Protocol Freelancer</h3>
           <p className="text-base text-[var(--text-secondary)] opacity-80 leading-relaxed max-w-2xl italic">
             "Bids submitted through the protocol are binding. Ensure your profile metadata and reputation NFTs are up-to-date for maximum trust ranking."
           </p>
        </div>
        <Link href="/profile" className="btn-secondary px-12 py-5 font-bold tracking-widest shrink-0 shadow-lg relative z-10">
           CONNECT_FOR_BIDS
        </Link>
      </aside>
    </div>
  );
}
