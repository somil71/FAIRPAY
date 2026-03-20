"use client";
import React, { useState, useEffect } from "react";
import ReputationCard from "@/components/reputation/ReputationCard";
import NFTReveal from "@/components/reputation/NFTReveal";

export default function ProfilePage({ params }: { params: { address: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.address) {
      fetch(`http://localhost:4000/api/reputation/${params.address}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Profile fetch error:", err);
          setLoading(false);
        });
    }
  }, [params.address]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-1000">
      <header className="mb-12 text-center flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center rounded-full mb-6 border border-[var(--primary)]/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/10 to-transparent"></div>
            <svg className="w-12 h-12 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="text-3xl font-bold font-mono tracking-tighter text-[var(--text-primary)]">{params.address}</h1>
        <p className="text-[var(--primary-light)] mt-3 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Verified On-Chain Resume</p>
      </header>

      <div className="card p-1">
        <ReputationCard address={params.address} data={data} loading={loading} />
      </div>

      <div className="mt-20">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-secondary)]">Soulbound Credentials</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <NFTReveal index={1} />
          <NFTReveal index={2} delay={0.2} />
          <NFTReveal index={3} delay={0.4} />
        </div>
      </div>
    </div>
  );
}
