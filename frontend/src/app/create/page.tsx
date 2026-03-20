"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { isValidAddress, safeChecksum } from "@/lib/contractHelpers";
import { CONTRACT_TEMPLATES } from "@/lib/contractHelpers";
import { useAppStore } from "@/store/appStore";
import AmountDisplay from "@/components/shared/AmountDisplay";
import AddressDisplay from "@/components/shared/AddressDisplay";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  paymentBps: number;
  verificationMethod: number;
}

function CreateContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { createContract, txPending, demoFormState, isDemoMode } = useAppStore();
  const templateId = searchParams.get("template");

  const [title, setTitle] = useState("");
  const [freelancer, setFreelancer] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", description: "", amount: "", paymentBps: 10000, verificationMethod: 0 }
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Apply template logic
  useEffect(() => {
    if (templateId) {
      const template = CONTRACT_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setTitle(template.name);
        setMilestones(template.milestones.map((m: any) => ({
          title: m.title,
          description: m.description,
          amount: "",
          paymentBps: m.paymentBps,
          verificationMethod: 0
        })));
      }
    }
  }, [templateId]);

  // Demo Mode Auto-fill
  useEffect(() => {
    if (isDemoMode && demoFormState) {
      setTitle(demoFormState.title);
      setFreelancer(demoFormState.freelancerAddr);
      setMilestones(demoFormState.milestones.map((m: any) => ({
        title: m.name,
        description: m.description,
        amount: m.amount,
        paymentBps: Math.floor(parseFloat(m.amount) * 10000), // simplistic fallback
        verificationMethod: m.verification === 'auto' ? 0 : m.verification === 'github' ? 1 : 2
      })));
    }
  }, [isDemoMode, demoFormState]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "", paymentBps: 0, verificationMethod: 0 }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalLocked = milestones.reduce((acc, m: MilestoneInput) => {
    try {
      return acc + (m.amount ? parseEther(m.amount) : 0n);
    } catch {
      return acc;
    }
  }, 0n);

  const handleDeploy = async () => {
    setValidationError(null);

    if (!isConnected) {
      setValidationError("Wallet not connected. Please connect to continue.");
      return;
    }
    if (!title.trim()) {
      setValidationError("Project title is required.");
      return;
    }
    if (!isValidAddress(freelancer)) {
      setValidationError("Invalid freelancer address.");
      return;
    }
    
    const formattedFreelancer = safeChecksum(freelancer);

    if (address && formattedFreelancer.toLowerCase() === address.toLowerCase()) {
      setValidationError("You cannot create a contract with yourself.");
      return;
    }

    try {
      const contractId = await createContract({
        title,
        freelancerAddr: formattedFreelancer,
        milestones: milestones.map((m: MilestoneInput) => ({
          name: m.title,
          description: m.description,
          amount: m.amount,
          verification: m.verificationMethod === 0 ? 'auto' : m.verificationMethod === 1 ? 'github' : 'ipfs'
        }))
      });

      router.push(`/contracts/${contractId}`);
    } catch (e: any) {
      setValidationError(e?.message || "Failed to create contract. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-16 relative animate-in fade-in duration-500 max-w-7xl mx-auto create-layout">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-12 text-left">
        <header className="flex flex-col gap-4">
          <span className="text-[11px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.5em]">New Contract</span>
          <h1 className="text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">Contract Setup</h1>
        </header>

        <section className="flex flex-col gap-8 bg-[var(--bg-secondary)] p-10 rounded-2xl border border-[var(--border)] shadow-xl">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold">Step 1</span>
            <h2 className="text-base font-bold uppercase tracking-widest text-[var(--text-secondary)]">Primary Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Infrastructure Sprint v2"
                className="bg-[var(--bg-input)] border border-[var(--border)] p-5 rounded-sm text-base focus:border-[var(--warning)] outline-none transition-all text-white shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Freelancer Address (0x...)</label>
              <input
                value={freelancer}
                onChange={(e) => setFreelancer(e.target.value)}
                placeholder="0x..."
                className="bg-[var(--bg-input)] border border-[var(--border)] p-5 rounded-sm text-base font-mono focus:border-[var(--warning)] outline-none transition-all text-[var(--primary-light)] shadow-inner"
              />
              {freelancer && !isValidAddress(freelancer) && (
                <div className="flex items-center gap-2 mt-2 px-2 text-[var(--danger)] animate-pulse">
                  <span className="text-lg">⚠</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Invalid Ethereum Address</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-10">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold">Step 2</span>
              <h2 className="text-base font-bold uppercase tracking-widest text-[var(--text-secondary)]">Milestones</h2>
            </div>
            <button
              onClick={addMilestone}
              className="text-[10px] font-mono font-bold text-[var(--warning)] hover:text-white transition-all py-2 px-6 bg-[var(--warning)]/10 rounded-full border border-[var(--warning)]/30 hover:bg-[var(--warning)]"
            >
              + Add Milestone
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {milestones.map((m, i) => (
              <div key={i} className="card p-10 flex flex-col gap-8 relative group transition-all rounded-2xl bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--warning)]/30">
                {milestones.length > 1 && (
                  <button
                    onClick={() => removeMilestone(i)}
                    className="absolute top-8 right-8 text-[var(--text-muted)] hover:text-[var(--danger)] transition-all text-4xl leading-none p-2"
                  >
                    ×
                  </button>
                )}
                
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                      <span>Milestone {i + 1}</span>
                      <div className="h-[1px] flex-1 bg-[var(--border)]" />
                   </div>
                   <input
                     value={m.title}
                     onChange={(e) => {
                       const newM = [...milestones];
                       newM[i] = { ...newM[i], title: e.target.value };
                       setMilestones(newM);
                     }}
                     placeholder="Name of delivery..."
                     className="bg-transparent border-none p-0 text-2xl font-bold focus:ring-0 outline-none text-white tracking-tight"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Amount (ETH)</label>
                    <div className="relative">
                      <input
                        value={m.amount}
                        onChange={(e) => {
                          const newM = [...milestones];
                          newM[i] = { ...newM[i], amount: e.target.value };
                          setMilestones(newM);
                        }}
                        placeholder="0.00"
                        type="number"
                        className="bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-sm text-base font-mono focus:border-[var(--warning)] outline-none w-full pr-12"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-[var(--warning)] font-bold">Ξ</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Verification Method</label>
                    <select
                      value={m.verificationMethod}
                      onChange={(e) => {
                        const newM = [...milestones];
                        newM[i] = { ...newM[i], verificationMethod: Number(e.target.value) };
                        setMilestones(newM);
                      }}
                      className="bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-sm text-sm focus:border-[var(--warning)] outline-none font-bold text-white appearance-none cursor-pointer"
                    >
                      <option value={0}>Auto-Release (48h)</option>
                      <option value={1}>GitHub Commit</option>
                      <option value={2}>IPFS Artifact</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-16 border-t border-[var(--border)] flex flex-col gap-8">
          {validationError && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-6 rounded-sm flex items-start gap-5 animate-in slide-in-from-top duration-300 shadow-xl">
              <span className="text-[var(--danger)] text-2xl">⚠</span>
              <div className="flex flex-col gap-1">
                 <span className="text-[11px] font-mono font-bold text-[var(--danger)] uppercase tracking-widest">Setup Error</span>
                 <p className="text-base text-[var(--text-primary)] font-semibold leading-relaxed">
                   {validationError}
                 </p>
              </div>
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={txPending}
            className="btn-primary w-full py-6 text-lg font-bold tracking-[0.3em] shadow-2xl disabled:opacity-50 transition-all uppercase group bg-gradient-to-r from-[var(--primary)] via-[var(--primary-dark)] to-[var(--primary)] bg-[length:200%_100%] animate-shimmer"
          >
            {txPending ? "Initializing Escrow..." : "Deploy Escrow Protocol"}
          </button>
          
          <div className="flex justify-center flex-wrap gap-8 opacity-40 text-[10px] font-mono font-bold uppercase tracking-tighter">
             <span>Est. Gas: Optimal</span>
             <span>Est. Settlement: ~12s</span>
             <span>Secured by Ethereum</span>
          </div>
        </section>
      </div>

      {/* Right Column: Preview */}
      <aside className="hidden lg:block w-[450px] sticky top-12 h-fit flex flex-col gap-12 text-left">
        <div className="flex flex-col gap-6">
          <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] pl-2">Contract Preview</span>

          <div className="card border-[var(--primary)] border shadow-[-20px_20px_80px_rgba(0,0,0,0.4)] p-12 flex flex-col gap-12 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] overflow-hidden relative group rounded-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/10 blur-[80px] pointer-events-none" />
            
            <header className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
                <span className="text-[11px] font-mono font-bold text-[var(--accent)] tracking-[0.3em]">Live Preview</span>
              </div>
              <h3 className="text-4xl font-bold tracking-tight leading-tight uppercase line-clamp-2">
                {title || "New Project"}
              </h3>
            </header>

            <div className="flex flex-col gap-10 border-y border-[var(--border)] py-10 relative">
              <AddressDisplay label="Client Address (You)" address={address || "0x0000...0000"} />
              <AddressDisplay label="Freelancer Address" address={freelancer || "0x0000...0000"} />
            </div>

            <div className="flex flex-col gap-10">
              <div className="bg-[var(--bg-primary)]/50 p-6 rounded-sm border border-[var(--border)]">
                <AmountDisplay
                  label="Total Escrow Value"
                  amount={totalLocked}
                  size="xl"
                  type="locked"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Milestones ({milestones.length})</span>
                  <div className="h-[2px] flex-1 bg-[var(--border)] mx-6" />
                </div>
                <div className="space-y-5">
                  {milestones.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-[12px] font-mono animate-in slide-in-from-right" style={{ animationDelay: `${i * 100}ms` }}>
                      <span className="text-[var(--text-secondary)] font-bold">#0{i + 1} {m.title || "Untitled Milestone"}</span>
                      <span className="text-[var(--primary-light)] font-bold tracking-tighter">Ξ {m.amount || "0"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-10 flex justify-between items-center opacity-40 border-t border-[var(--border)]">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Status: Ready</span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Protocol v1.0</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--danger)]/5 to-transparent border border-[var(--danger)]/20 p-10 rounded-2xl flex flex-col gap-5 relative overflow-hidden group hover:bg-[var(--danger)]/[0.08] transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--danger)]/30 group-hover:bg-[var(--danger)] transition-colors" />
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold text-[var(--danger)] uppercase tracking-[0.4em]">Security Warning</span>
          </div>
          <p className="text-sm font-body text-[var(--text-secondary)] opacity-80 leading-relaxed italic">
            "Once deployed, the escrow parameters cannot be modified. Ensure the freelancer's identity is verified."
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function CreateContract() {
  return (
    <Suspense fallback={
      <div className="h-[70vh] flex flex-col items-center justify-center text-center gap-12 font-mono">
        <div className="w-24 h-24 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border)] flex items-center justify-center text-5xl animate-spin-slow">
          ⚓
        </div>
        <div className="flex flex-col gap-4">
           <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] uppercase">
              Connecting...
           </h2>
           <span className="text-xs font-mono text-[var(--text-muted)] font-bold tracking-[0.4em] animate-pulse">Establishing Secure Connection</span>
        </div>
      </div>
    }>
      <CreateContractForm />
    </Suspense>
  );
}
