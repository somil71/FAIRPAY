"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AmountDisplay from "@/components/shared/AmountDisplay";
import { Badge } from "@/components/ui/Badge";

// Same mock data as the jobs board — in production this would be fetched by ID
const MOCK_JOBS = [
  {
    id: "J001",
    title: "Full-Stack_Escrow_Frontend",
    client: "0x4a5b...7c8d",
    amount: 12000000000000000000n,
    category: "DEVELOPMENT",
    tags: ["Next.js", "Solidity", "CSS"],
    description: "Looking for a specialized developer to rebuild an escrow frontend with high-fidelity aesthetics and BigInt logic stabilization. The interface must support real-time wallet connection, milestone tracking, and dispute submission flows.",
    postedAt: "2026-03-15T09:00:00Z",
    deadline: "2026-04-30T23:59:00Z",
    milestones: [
      { title: "Design_System", bps: 2000, description: "Figma tokens, component library, and CSS variable architecture." },
      { title: "Core_Pages", bps: 4000, description: "Dashboard, contracts ledger, create wizard, and job board." },
      { title: "Web3_Integration", bps: 2500, description: "Wagmi hooks, wallet connect, and on-chain read/write flows." },
      { title: "Final_Polish_&_Tests", bps: 1500, description: "Accessibility, performance, cross-browser testing, final handoff." },
    ],
  },
  {
    id: "J002",
    title: "Premium_Logo_Noir_Style",
    client: "0x1d2e...3f4g",
    amount: 2500000000000000000n,
    category: "DESIGN",
    tags: ["Branding", "SVG", "Noir"],
    description: "Institutional branding for a decentralized protocol. Needs Playfair Display expertise and copper palette mastery.",
    postedAt: "2026-03-17T12:00:00Z",
    deadline: "2026-04-15T23:59:00Z",
    milestones: [
      { title: "Concept_Presentation", bps: 3000, description: "3 logo directions with rationale." },
      { title: "Chosen_Direction_Refinement", bps: 4000, description: "Iterating on selected concept." },
      { title: "File_Delivery", bps: 3000, description: "SVG, PNG, and brand guidelines." },
    ],
  },
  {
    id: "J003",
    title: "ZK-Proof_Audit_Sprint",
    client: "0x8h9i...0j1k",
    amount: 25000000000000000000n,
    category: "SECURITY",
    tags: ["ZK", "Audit", "Rust"],
    description: "Complete security audit for a zero-knowledge circuit implementation. High stakes, multi-sig arbitration required.",
    postedAt: "2026-03-10T08:00:00Z",
    deadline: "2026-05-01T23:59:00Z",
    milestones: [
      { title: "Scope_Review", bps: 2500, description: "Codebase review and scope definition." },
      { title: "Initial_Audit", bps: 5000, description: "Full security analysis and vulnerability report." },
      { title: "Remediation_Review", bps: 2500, description: "Verify developer fixes and final sign-off." },
    ],
  },
  {
    id: "J004",
    title: "Technical_Writeup_V1",
    client: "0x2k3l...4m5n",
    amount: 1500000000000000000n,
    category: "CONTENT",
    tags: ["Technical", "Documentation"],
    description: "Drafting the V1 protocol whitepaper. Focus on game theory and dispute settlement mechanics.",
    postedAt: "2026-03-19T15:00:00Z",
    deadline: "2026-04-10T23:59:00Z",
    milestones: [
      { title: "Outline_&_Research", bps: 3000, description: "TOC, key claims, and literature review." },
      { title: "Draft_v1", bps: 5000, description: "Full whitepaper draft." },
      { title: "Final_Edit", bps: 2000, description: "Proof-read, formatting, PDF export." },
    ],
  },
];

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const job = MOCK_JOBS.find(j => j.id === jobId);

  const [bidAmount, setBidAmount] = useState("");
  const [bidNote, setBidNote] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  if (!job) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
        <span className="text-6xl opacity-20">⊘</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-secondary)]">
          Record Not Found
        </h1>
        <p className="text-[11px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">
          Job ID: {jobId} does not exist in the ledger
        </p>
        <Link href="/jobs" className="btn-secondary text-[10px] py-3 px-10 mt-4 uppercase font-bold tracking-widest">
          ← Return to Job Board
        </Link>
      </div>
    );
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleBid = () => {
    setBidError(null);
    const amt = parseFloat(bidAmount);
    if (!bidAmount || isNaN(amt) || amt <= 0) {
      setBidError("Enter a valid bid amount in ETH.");
      return;
    }
    if (!bidNote.trim()) {
      setBidError("Please include a brief proposal note.");
      return;
    }
    setBidSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">
        <Link href="/jobs" className="hover:text-[var(--primary-light)] transition-colors">Job Board</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-secondary)]">{job.id}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[var(--border)] pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-[var(--primary-light)] font-bold uppercase tracking-widest">Job ID: {job.id}</span>
            <Badge variant="info">{job.category}</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight uppercase">
            {job.title.replace(/_/g, " ")}
          </h1>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Client Address</span>
              <span className="text-sm text-[var(--text-secondary)] font-bold font-mono">{job.client}</span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--border)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Posted On</span>
              <span className="text-sm text-[var(--text-secondary)] font-bold">{new Date(job.postedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <AmountDisplay amount={job.amount} size="xl" type="locked" label="Protocol Offer" />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${daysLeft <= 7 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
            <span className={`w-2 h-2 rounded-full ${daysLeft <= 7 ? 'bg-[var(--danger)] animate-pulse' : 'bg-[var(--text-muted)]'}`} />
            {daysLeft} Days Remaining
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* LEFT: Project Details */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {job.tags.map(tag => (
              <span key={tag} className="text-[10px] font-mono text-[var(--text-secondary)] border border-[var(--border)] px-4 py-2 rounded-lg bg-[var(--bg-secondary)] uppercase font-bold tracking-wider">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <section className="flex flex-col gap-6">
            <h2 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] border-b border-[var(--border)] pb-4">
              Project Brief
            </h2>
            <p className="text-lg font-body text-[var(--text-secondary)] leading-relaxed opacity-90 font-light">
              {job.description}
            </p>
          </section>

          {/* Milestones */}
          <section className="flex flex-col gap-6">
            <h2 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] border-b border-[var(--border)] pb-4">
              Payment Schedule ({job.milestones.length} Milestones)
            </h2>
            <div className="flex flex-col gap-4">
              {job.milestones.map((m, i) => (
                <div key={i} className="card p-8 flex items-start gap-8 border-l-4 border-[var(--border)] hover:border-[var(--primary)] transition-all bg-[var(--bg-secondary)] rounded-2xl group">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[11px] font-mono font-bold text-[var(--primary-light)] shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">
                        {m.title.replace(/_/g, " ")}
                      </span>
                      <Badge variant="info">{(m.bps / 100).toFixed(0)}%</Badge>
                    </div>
                    <p className="text-base font-body text-[var(--text-secondary)] opacity-70 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Bid Panel */}
        <aside className="flex flex-col gap-8">
          {bidSubmitted ? (
            <div className="card p-10 border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col gap-8 text-center rounded-3xl animate-in zoom-in duration-500 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-3xl mx-auto text-[var(--accent)]">
                ✓
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold tracking-tight text-[var(--accent)] uppercase">Proposal Submitted</h3>
                <p className="text-sm font-body text-[var(--text-secondary)] leading-relaxed opacity-80">
                  Your proposal has been successfully recorded on the protocol. The client will review and respond via the secure gateway.
                </p>
              </div>
              <Link href="/jobs" className="btn-secondary w-full py-4 text-[10px] font-bold tracking-widest uppercase rounded-xl">
                ← Back to Jobs
              </Link>
            </div>
          ) : (
            <div className="card p-10 flex flex-col gap-8 sticky top-12 bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-2xl">
              <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] border-b border-[var(--border)] pb-4">
                Submit Proposal
              </h3>

              {/* Budget reference */}
              <div className="flex justify-between items-center bg-[var(--bg-primary)]/40 border border-[var(--border)] p-5 rounded-xl">
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Client Budget</span>
                <AmountDisplay amount={job.amount} size="md" type="locked" />
              </div>

              {/* Bid Amount */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Your Price (ETH)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono">Ξ</span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-4 pl-10 rounded-xl text-base font-mono focus:border-[var(--primary-light)] outline-none transition-all text-[var(--text-primary)] shadow-inner"
                  />
                </div>
              </div>

              {/* Proposal Note */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Proposal Details</label>
                <textarea
                  value={bidNote}
                  onChange={(e) => setBidNote(e.target.value)}
                  placeholder="Outline your relevant experience and specific approach..."
                  rows={6}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-xl text-sm font-body focus:border-[var(--primary-light)] outline-none transition-all resize-none text-[var(--text-primary)] shadow-inner"
                />
              </div>

              {bidError && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-[var(--danger)] text-lg">⚠</span>
                  <p className="text-[10px] font-mono font-bold text-[var(--danger)] uppercase">{bidError}</p>
                </div>
              )}

              <button
                onClick={handleBid}
                className="btn-primary w-full py-5 text-[11px] font-bold tracking-[0.3em] shadow-xl uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Transmit Proposal
              </button>

              <div className="flex flex-col gap-2 opacity-30 text-center">
                 <div className="h-[1px] bg-[var(--border)]" />
                 <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase leading-relaxed font-bold tracking-tighter">
                   Binding Protocol Signature Required on Acceptance
                 </p>
              </div>
            </div>
          )}

          {/* Deadline Card */}
          <div className="card p-8 flex flex-col gap-4 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border-[var(--border)] rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Project Schedule</span>
            <div className="flex justify-between items-center border-b border-[var(--border)]/50 pb-3">
              <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Window Closes</span>
              <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">
                {new Date(job.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Time Left</span>
              <span className={`text-[11px] font-mono font-bold uppercase ${daysLeft <= 7 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                {daysLeft} Days
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
