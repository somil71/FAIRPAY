'use client';
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AmountDisplay from "@/components/shared/AmountDisplay";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { fromWeiString, parseEthInput, toWeiString } from '@/lib/bigintUtils';
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

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<ApiJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bidAmount, setBidAmount] = useState("");
  const [bidNote, setBidNote] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { isConnected, address } = useAccount();
  const currentUser = useAppStore(s => s.currentUser);
  const backendOnline = useAppStore(s => s.backendConnected);
  const storeJobs = useAppStore(s => s.jobs);
  const { submitBid } = useAppStore();

  useEffect(() => {
    setLoading(true);
    api.get<{ job: ApiJob }>(`/api/jobs/${jobId}`)
      .then(data => setJob(data.job))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 0) {
          console.warn('[DEMO FALLBACK] Job Detail: backend unreachable, using store');
          const storeJob = storeJobs.find(j => j.id === jobId);
          if (storeJob) {
            setJob({
              id:          storeJob.id,
              title:       storeJob.title,
              category:    storeJob.category,
              description: storeJob.description,
              skills:      storeJob.skills,
              budgetWei:   storeJob.budget.toString(),
              bondWei:     storeJob.bondRequired.toString(),
              deadline:    storeJob.deadline,
              bidCount:    storeJob.bids,
              status:      'OPEN',
              client: {
                address:     storeJob.client.address,
                displayName: storeJob.client.displayName ?? null,
              },
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          setError((err as Error).message);
        }
      })
      .finally(() => setLoading(false));
  }, [jobId, storeJobs]);

  const handleBidSubmit = async () => {
    setBidError(null);

    let parsedAmountWei: bigint;
    try {
      parsedAmountWei = parseEthInput(bidAmount);
    } catch (err: any) {
      setBidError(err.message ?? 'Invalid amount');
      return;
    }

    if (!bidNote.trim()) {
      setBidError("Please provide a cover message.");
      return;
    }

    if (!isConnected || !currentUser.address) {
      setBidError("Please connect your wallet first.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/api/jobs/${job!.id}/bid`, {
        amountWei:      parsedAmountWei.toString(),
        bondWei:        job!.bondWei,
        message:        bidNote.trim(),
        bidderAddress:  currentUser.address,
      }, currentUser.address);

      setBidSubmitted(true);
      // Optional: use toast system here
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        console.warn('[DEMO FALLBACK] Bid: backend unreachable, using store');
        await submitBid(job!.id, parsedAmountWei, bidNote);
        setBidSubmitted(true);
      } else {
        setBidError((err as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return <div className="h-[60vh] flex items-center justify-center animate-pulse text-[var(--primary)] text-2xl font-mono uppercase tracking-widest">CONNECTING_TO_LEDGER...</div>;
  }

  if (error || !job) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
        <span className="text-6xl opacity-20">⊘</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-secondary)]">
          Record Not Found
        </h1>
        <p className="text-[11px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">
          {error ?? `Job ID: ${jobId} does not exist on the ledger`}
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

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">
        <Link href="/jobs" className="hover:text-[var(--primary-light)] transition-colors">Job Board</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-secondary)]">{job.id.slice(0, 8)}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[var(--border)] pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-[var(--primary-light)] font-bold uppercase tracking-widest">Job ID: {job.id.slice(0, 8)}</span>
            <Badge variant="info">{job.category}</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight uppercase">
            {job.title.replace(/_/g, " ")}
          </h1>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Client Address</span>
              <span className="text-sm text-[var(--text-secondary)] font-bold font-mono">
                {job.client.displayName ?? `${job.client.address.slice(0,6)}...${job.client.address.slice(-4)}`}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--border)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Posted On</span>
              <span className="text-sm text-[var(--text-secondary)] font-bold">
                 {new Date(job.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <AmountDisplay amount={fromWeiString(job.budgetWei)} size="xl" type="locked" label="Protocol Offer" />
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
            {job.skills.map(tag => (
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
            <p className="text-lg font-body text-[var(--text-secondary)] leading-relaxed opacity-90 font-light whitespace-pre-line">
              {job.description}
            </p>
          </section>
        </div>

        {/* RIGHT: Bid Panel */}
        <aside className="flex flex-col gap-8">
          {bidSubmitted ? (
            <div className="card p-10 border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col gap-8 text-center rounded-3xl animate-in zoom-in duration-500 shadow-2xl">
               <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-3xl mx-auto text-[var(--accent)]">✓</div>
               <div className="flex flex-col gap-3">
                 <h3 className="text-2xl font-bold tracking-tight text-[var(--accent)] uppercase">Proposal Submitted</h3>
                 <p className="text-sm font-body text-[var(--text-secondary)] leading-relaxed opacity-80">
                   Your proposal has been successfully recorded on the protocol. The client will review and respond.
                 </p>
               </div>
               <Link href="/jobs" className="btn-secondary w-full py-4 text-[10px] font-bold tracking-widest uppercase rounded-xl">← Return to Board</Link>
            </div>
          ) : (
            <div className="card p-10 flex flex-col gap-8 sticky top-12 bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-2xl">
              <h3 className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] border-b border-[var(--border)] pb-4">
                Submit Proposal
              </h3>

              {/* Budget reference */}
              <div className="flex justify-between items-center bg-[var(--bg-primary)]/40 border border-[var(--border)] p-5 rounded-xl">
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Client Budget</span>
                <AmountDisplay amount={fromWeiString(job.budgetWei)} size="md" type="locked" />
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
                    disabled={submitting}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-4 pl-10 rounded-xl text-base font-mono focus:border-[var(--primary-light)] outline-none transition-all text-[var(--text-primary)] shadow-inner disabled:opacity-50"
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
                  disabled={submitting}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-xl text-sm font-body focus:border-[var(--primary-light)] outline-none transition-all resize-none text-[var(--text-primary)] shadow-inner disabled:opacity-50"
                />
              </div>

              {bidError && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-4 rounded-xl flex items-center gap-3">
                   <span className="text-[var(--danger)] text-lg">⚠</span>
                   <p className="text-[10px] font-mono font-bold text-[var(--danger)] uppercase">{bidError}</p>
                </div>
              )}

              <button
                onClick={handleBidSubmit}
                disabled={submitting || !isConnected}
                className="btn-primary w-full py-5 text-[11px] font-bold tracking-[0.3em] shadow-xl uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <><span className="animate-spin text-xl">◌</span><span>Transmitting...</span></>
                ) : !isConnected ? (
                  "Connect Wallet to Bid"
                ) : (
                  "Transmit Proposal"
                )}
              </button>

              <div className="flex flex-col gap-2 opacity-30 text-center">
                 <div className="h-[1px] bg-[var(--border)]" />
                 <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase leading-relaxed font-bold tracking-tighter">
                   Binding Protocol Signature Required on Acceptance
                 </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
