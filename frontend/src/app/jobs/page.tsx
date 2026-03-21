'use client';
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AmountDisplay from "@/components/shared/AmountDisplay";
import { formatEther }  from 'viem';
import { api, ApiError } from '@/lib/api';
import { fromWeiString } from '@/lib/bigintUtils';
import { useAppStore }   from '@/store/appStore';
import { useAccount } from 'wagmi';

interface ApiJob {
  id:          string;
  title:       string;
  category:    string;
  description: string;
  skills:      string[];
  budgetWei:   string;
  bondWei:     string;
  deadline:    string;
  bidCount:    number;
  status:      string;
  client: {
    address:     string;
    displayName: string | null;
  };
  createdAt: string;
}

export default function JobBoard() {
  const [jobs, setJobs]                   = useState<ApiJob[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("ALL");
  const [page, setPage]                   = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const storeJobs      = useAppStore(s => s.jobs);
  const backendOnline  = useAppStore(s => s.backendConnected);
  const { isConnected } = useAccount();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [category, debouncedSearch]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (category !== 'ALL') params.set('category', category);
    if (debouncedSearch)    params.set('search', debouncedSearch);

    try {
      const data = await api.get<{ jobs: ApiJob[]; total: number }>(`/api/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        // Backend offline — fall back to store jobs
        console.warn('[DEMO FALLBACK] Jobs: backend unreachable, using store');
        const fallback = storeJobs
          .filter(j => category === 'ALL' || j.category === category)
          .filter(j => !debouncedSearch ||
            j.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
        setJobs(fallback.map(j => ({
          id:          j.id,
          title:       j.title,
          category:    j.category,
          description: j.description,
          skills:      j.skills,
          budgetWei:   j.budget.toString(),
          bondWei:     j.bondRequired.toString(),
          deadline:    j.deadline,
          bidCount:    j.bids,
          status:      'OPEN',
          client: {
            address:     j.client.address,
            displayName: j.client.displayName ?? null,
          },
          createdAt: new Date().toISOString(),
        })));
        setTotal(fallback.length);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch, storeJobs]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

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
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by role, tag, or protocol node..."
               className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] p-5 pl-14 rounded-2xl text-base focus:border-[var(--primary-light)] outline-none transition-all shadow-lg"
             />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
             {["ALL", "DEVELOPMENT", "DESIGN", "SECURITY", "LEGAL", "CONTENT"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-8 py-5 rounded-2xl font-bold text-xs tracking-widest transition-all whitespace-nowrap border ${category === cat ? 'bg-[var(--primary)] text-white border-transparent shadow-xl' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {!loading && !error && jobs.length > 0 ? (
          jobs.map((j) => (
            <div key={j.id} className="card p-10 flex flex-col gap-8 relative overflow-hidden group hover:border-[var(--primary)] transition-all bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--primary)]/20 uppercase">
                  {j.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase">Job ID: {j.id.slice(0, 8)}</span>
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
                {j.skills.map(t => (
                  <span key={t} className="text-[9px] font-mono font-bold text-[var(--text-muted)] border border-[var(--border)] px-4 py-1.5 rounded-full uppercase group-hover:border-[var(--primary)]/30 transition-colors">
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-8 mt-auto border-t border-[var(--border)]/50 flex flex-col gap-6">
                 <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest pl-1">PROTOCOL_OFFER</span>
                       <AmountDisplay amount={fromWeiString(j.budgetWei)} size="lg" type="locked" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">DEADLINE</span>
                       <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase">
                         {j.deadline} 
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
        ) : !loading && !error && jobs.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center text-center gap-6 opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
             <span className="text-6xl">📡</span>
             <h3 className="text-2xl font-bold tracking-tight text-[var(--text-muted)] uppercase">No jobs match your search</h3>
             {(search || category !== 'ALL') && (
               <button className="btn-ghost" onClick={() => { setSearch(""); setCategory('ALL'); }}>
                 Clear filters
               </button>
             )}
          </div>
        ) : loading ? (
           <div className="col-span-full h-80 flex flex-col items-center justify-center text-center gap-6 opacity-50">
             <span className="text-xl animate-pulse">Loading Opportunities...</span>
           </div>
        ) : null}
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
        {!isConnected ? (
          <div className="flex flex-col items-center gap-2">
            <p style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }} className="text-sm">
              Connect your wallet to submit a bid
            </p>
            <Link href="/profile" className="btn-secondary px-12 py-5 font-bold tracking-widest shrink-0 shadow-lg relative z-10 w-full text-center">
              Connect Wallet
            </Link>
          </div>
        ) : (
          <Link href="/profile" className="btn-secondary px-12 py-5 font-bold tracking-widest shrink-0 shadow-lg relative z-10 text-center">
             Manage Profile
          </Link>
        )}
      </aside>
    </div>
  );
}
