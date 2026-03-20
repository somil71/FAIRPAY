"use client";
import React, { useState, useEffect, Suspense } from "react";
import AmountDisplay from "@/components/shared/AmountDisplay";
import AddressDisplay from "@/components/shared/AddressDisplay";
import { useAppStore, Dispute } from "@/store/appStore";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

const RULING_OPTIONS = ["FULL_REFUND", "PARTIAL_REFUND", "TOTAL_RELEASE"] as const;
type RulingOption = typeof RULING_OPTIONS[number];

const RULING_COLORS: Record<RulingOption, string> = {
  FULL_REFUND: "text-[var(--danger)]",
  PARTIAL_REFUND: "text-[var(--warning)]",
  TOTAL_RELEASE: "text-[var(--success)]",
};

function ArbitrationContent() {
  const searchParams = useSearchParams();
  const disputeIdParam = searchParams.get("id") || searchParams.get("contractId");
  
  const { disputes, voteOnDispute, txPending, isDemoMode, ensureDemoDispute } = useAppStore();
  const [activeTab, setActiveTab] = useState("Active Disputes");
  const [activeDispute, setActiveDispute] = useState<Dispute | null>(null);
  const [selectedRuling, setSelectedRuling] = useState<RulingOption>("PARTIAL_REFUND");
  const [voteNote, setVoteNote] = useState("");
  const [evidenceTab, setEvidenceTab] = useState<"CLAIMANT" | "RESPONDENT">("CLAIMANT");

  // Demo Mode Init
  useEffect(() => {
    if (isDemoMode) {
      ensureDemoDispute('DEMO-D001');
    }
  }, [isDemoMode, ensureDemoDispute]);

  // Handle direct mapping from URL
  useEffect(() => {
    if (disputeIdParam) {
      const d = disputes.find(dis => dis.id === disputeIdParam || dis.contractId === disputeIdParam);
      if (d) {
        openPanel(d);
      }
    }
  }, [disputeIdParam, disputes]);

  const openPanel = (d: Dispute) => {
    setActiveDispute(d);
    setSelectedRuling(d.rulingType as RulingOption || "PARTIAL_REFUND");
    setVoteNote("");
    setEvidenceTab("CLAIMANT");
  };

  const closePanel = () => setActiveDispute(null);

  const handleSubmitVote = async () => {
    if (!activeDispute) return;
    await voteOnDispute(activeDispute.id, selectedRuling, voteNote);
    setTimeout(closePanel, 1500);
  };

  const claimantEvidence = activeDispute?.evidence.filter(e => e.party.toUpperCase() === "CLAIMANT" || e.party.toLowerCase() === "client") ?? [];
  const respondentEvidence = activeDispute?.evidence.filter(e => e.party.toUpperCase() === "RESPONDENT" || e.party.toLowerCase() === "freelancer") ?? [];

  return (
    <div className="flex flex-col gap-12 relative animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.4em]">
            Justice Module v1.0
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Arbitration Hub
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="success">Arbitrator Status: Active</Badge>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex gap-10 border-b border-[var(--border)] pb-4 overflow-x-auto custom-scrollbar">
        {["Active Disputes", "Evidence Logs", "My Rulings", "Register"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[11px] font-mono font-bold tracking-[0.2em] transition-all whitespace-nowrap pb-4 -mb-[18px] ${activeTab === tab ? 'text-[var(--primary-light)] border-b-2 border-[var(--primary-light)] opacity-100' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] opacity-60'}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Dispute List */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {activeTab === "Active Disputes" ? (
            disputes.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-center gap-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl opacity-40 border-dashed">
                 <span className="text-5xl opacity-20">⚖️</span>
                 <p className="text-[11px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-[0.4em]">No Active Disputes Found</p>
               </div>
            ) : (
              disputes.map((d) => (
                <div key={d.id} className={`card p-10 border-l-4 ${d.status === 'RESOLVED' ? 'border-[var(--accent)] border-opacity-40' : 'border-[var(--danger)]/50'} flex flex-col gap-8 relative overflow-hidden group hover:border-[var(--primary)] transition-all bg-[var(--bg-secondary)] rounded-2xl shadow-xl`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-[var(--danger)] font-bold tracking-[0.1em]">Dispute #{d.id}</span>
                      <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary-light)] transition-colors uppercase">
                        {d.title}
                      </h3>
                      <div className="flex flex-wrap gap-10 mt-2">
                        <AddressDisplay label="Claimant" address={d.claimant.address} />
                        <AddressDisplay label="Respondent" address={d.respondent.address} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant={d.status === 'RESOLVED' ? 'success' : 'disputed'}>{d.status}</Badge>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Votes: {d.votesCollected}/{d.votesRequired}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-12 py-8 border-y border-[var(--border)] bg-[var(--bg-primary)]/40 -mx-10 px-10 group-hover:bg-[var(--bg-elevated)]/20 transition-colors">
                    <AmountDisplay label="Total Value" amount={d.totalContractVal} size="md" type="locked" />
                    <AmountDisplay label="Contested Amount" amount={d.contestedAmount} size="md" type="outgoing" />
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Ruling Recommendation</span>
                      <span className={`text-xl font-mono font-bold tracking-tighter ${RULING_COLORS[d.rulingType as RulingOption] ?? "text-[var(--primary)]"}`}>
                        {d.rulingType}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      {[...Array(d.votesRequired)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < d.votesCollected ? 'bg-[var(--primary)] shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'}`} />
                      ))}
                    </div>
                    {d.status === "RESOLVED" ? (
                      <span className="text-[10px] font-mono text-[var(--accent)] font-bold tracking-widest italic uppercase">✓ Case Resolved</span>
                    ) : (
                      <button
                        onClick={() => openPanel(d)}
                        className="btn-primary text-[11px] py-3 px-10 shadow-lg border border-[var(--primary)]/30 hover:border-[var(--primary-light)] transition-all uppercase tracking-widest font-bold"
                      >
                        Review & Vote
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl opacity-40 border-dashed">
              <span className="text-5xl">⚓</span>
              <p className="text-[11px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-[0.4em]">Syncing Evidence...</p>
            </div>
          )}
        </div>

        {/* Arbitrator Intelligence */}
        <aside className="flex flex-col gap-8">
          <div className="card p-10 flex flex-col gap-10 bg-[var(--bg-secondary)] border-[var(--border)] shadow-2xl relative overflow-hidden rounded-2xl">
            <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] border-b border-[var(--border)] pb-6">
              Arbitrator Profile
            </h3>
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end border-b border-[var(--border)]/50 pb-6">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold uppercase tracking-widest">Cases Resolved</span>
                <span className="text-4xl font-bold tracking-tighter text-[var(--text-primary)] leading-none">148</span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--border)]/50 pb-6">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold uppercase tracking-widest">Consensus Rate</span>
                <span className="text-4xl font-bold tracking-tighter text-[var(--accent)] leading-none">94.2%</span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--border)]/50 pb-6">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold uppercase tracking-widest">Rewards Earned</span>
                <div className="flex items-baseline gap-1 text-[var(--primary-light)] font-bold">
                  <span className="text-lg">Ξ</span>
                  <span className="text-4xl tracking-tighter leading-none font-mono">1.24</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 flex flex-col gap-6">
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Expertise Areas</span>
              <div className="flex flex-wrap gap-3">
                {["Smart Contracts", "Protocol Design", "Data Integrity"].map(s => (
                  <span key={s} className="text-[9px] font-mono text-[var(--primary-light)] border border-[var(--primary)]/30 px-4 py-2 rounded-lg bg-[var(--primary)]/5 uppercase font-bold tracking-wider">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border)] p-10 rounded-2xl flex flex-col gap-6 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--accent)]/40 group-hover:bg-[var(--accent)] transition-colors" />
            <span className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
               Security Protocol
            </span>
            <p className="text-sm font-body text-[var(--text-secondary)] opacity-80 leading-relaxed italic">
              "Every ruling is recorded on the public ledger. Your trust score is calculated based on consensus alignment and historical accuracy."
            </p>
          </div>
        </aside>
      </section>

      {/* ── VOTE PANEL OVERLAY ──────────────────────────────────────── */}
      {activeDispute && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-2xl animate-in fade-in duration-500"
            onClick={closePanel}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-[700px] bg-[var(--bg-secondary)] border-l border-[var(--border)] z-50 flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-700 overflow-y-auto custom-scrollbar">
            {/* Panel Header */}
            <div className="flex items-start justify-between p-12 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-md z-10">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono text-[var(--danger)] font-bold tracking-widest uppercase">Dispute #{activeDispute.id}</span>
                <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] uppercase">{activeDispute.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                   <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold tracking-widest uppercase">Verification Module</span>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-all text-5xl leading-none hover:rotate-90 p-2"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-12 p-12 pb-24">
              {/* Amounts Summary */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-[var(--bg-elevated)] p-10 rounded-2xl flex flex-col gap-3 border border-[var(--border)] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 blur-3xl" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Total Escrow</span>
                  <AmountDisplay amount={activeDispute.totalContractVal} size="lg" type="locked" />
                </div>
                <div className="bg-[var(--bg-elevated)] p-10 rounded-2xl flex flex-col gap-3 border border-[var(--border)] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--danger)]/5 blur-3xl" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Contested Amount</span>
                  <AmountDisplay amount={activeDispute.contestedAmount} size="lg" type="outgoing" />
                </div>
              </div>

              {/* Evidence Tabs */}
              <div className="flex flex-col gap-8">
                <div className="flex gap-10 border-b border-[var(--border)]">
                  {(["CLAIMANT", "RESPONDENT"] as const).map(party => (
                    <button
                      key={party}
                      onClick={() => setEvidenceTab(party)}
                      className={`text-[11px] font-mono font-bold tracking-[0.2em] pb-6 transition-all relative ${evidenceTab === party ? 'text-[var(--primary-light)] opacity-100' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] opacity-50'}`}
                    >
                      {party} EVIDENCE
                      {evidenceTab === party && <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary-light)] rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-6 min-h-[250px]">
                  {(evidenceTab === "CLAIMANT" ? claimantEvidence : respondentEvidence).length === 0 ? (
                    <div className="bg-[var(--bg-primary)]/40 border border-dashed border-[var(--border)] p-20 rounded-2xl text-center flex flex-col gap-4">
                      <span className="text-4xl opacity-10">📂</span>
                      <p className="text-[11px] font-mono text-[var(--text-muted)] font-bold tracking-widest uppercase">No evidence submitted yet</p>
                    </div>
                  ) : (
                    (evidenceTab === "CLAIMANT" ? claimantEvidence : respondentEvidence).map((ev, i) => (
                      <div key={i} className={`p-10 rounded-2xl flex flex-col gap-5 transition-all border ${evidenceTab === "CLAIMANT" ? "border-[var(--danger)]/10 bg-[var(--danger)]/5" : "border-[var(--success)]/10 bg-[var(--success)]/5"} shadow-lg`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[11px] font-mono font-bold tracking-widest uppercase ${evidenceTab === "CLAIMANT" ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                             Transcript #{i+1}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold opacity-60">
                            {new Date(ev.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-base text-[var(--text-secondary)] leading-relaxed opacity-90 font-body">{ev.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ruling Selection */}
              <div className="flex flex-col gap-8">
                <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] pl-1">Final Settlement Recommendation</span>
                <div className="flex flex-col gap-5">
                  {RULING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedRuling(opt)}
                      className={`flex items-center justify-between p-8 rounded-2xl border-2 transition-all text-left group ${selectedRuling === opt ? 'border-[var(--primary-light)] bg-[var(--primary)]/5 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-[var(--border)] bg-[var(--bg-elevated)]/30 hover:border-[var(--border-light)]'}`}
                    >
                      <div className="flex items-center gap-10">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedRuling === opt ? 'border-[var(--primary-light)]' : 'border-[var(--text-muted)] group-hover:border-[var(--text-secondary)]'}`}>
                          {selectedRuling === opt && <div className="w-4 h-4 rounded-full bg-[var(--primary-light)] shadow-lg" />}
                        </div>
                        <span className={`text-base font-bold tracking-wider uppercase transition-colors ${selectedRuling === opt ? RULING_COLORS[opt] : 'text-[var(--text-secondary)]'}`}>
                          {opt.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold transition-opacity hidden md:block ${selectedRuling === opt ? 'opacity-100 text-[var(--primary-light)]' : 'opacity-40'}`}>
                        {opt === "FULL_REFUND" ? "100% Back to Client" : opt === "PARTIAL_REFUND" ? "Split Funds" : "Release to Freelancer"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arbitrator Note */}
              <div className="flex flex-col gap-5">
                <label className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Justification Note</label>
                <textarea
                  value={voteNote}
                  onChange={(e) => setVoteNote(e.target.value)}
                  placeholder="Draft the official reasoning for this settlement..."
                  rows={5}
                  className="bg-[var(--bg-input)] border border-[var(--border)] p-8 rounded-2xl text-sm font-body focus:border-[var(--primary-light)] outline-none transition-all resize-none text-[var(--text-primary)] focus:shadow-2xl"
                />
              </div>

              {/* Submit Vote */}
              <div className="flex flex-col gap-8 pt-12 border-t border-[var(--border)]">
                 <button
                   onClick={handleSubmitVote}
                   disabled={txPending || !voteNote.trim()}
                   className="btn-primary w-full py-8 text-lg font-bold tracking-[0.4em] shadow-2xl transition-all uppercase group relative overflow-hidden disabled:opacity-50"
                 >
                   <span className="relative z-10">{txPending ? "Submitting Ruling..." : "Sign & Submit Ruling"}</span>
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                 </button>
                 <div className="flex justify-center items-center gap-6 opacity-30">
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Requires Encrypted Signature v2.0</span>
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                 </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ArbitrationHub() {
  return (
    <Suspense fallback={
       <div className="h-[60vh] flex items-center justify-center font-mono text-[var(--text-muted)] uppercase tracking-[0.5em] animate-pulse">
          Initializing Justice Module...
       </div>
    }>
       <ArbitrationContent />
    </Suspense>
  );
}
