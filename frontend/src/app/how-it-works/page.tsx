"use client";
import React from "react";
import { motion } from "framer-motion";
import EscrowFlowAnimation from "@/components/shared/EscrowFlowAnimation";

/**
 * Page: How It Works
 * Aesthetic: Oxidized Copper · Financial Noir
 * Purpose: Education & Trust Building with interactive visualizers.
 */
export default function HowItWorks() {
  return (
    <div className="flex flex-col gap-32 max-w-5xl">
      {/* 1. Header */}
      <section className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-[var(--copper)] uppercase tracking-[0.4em] mb-6">
            Protocol Documentation
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 font-display">
            The Mechanics of <br />
            <span className="text-[var(--text-secondary)] italic">Trustless Settlement.</span>
          </h1>
          <p className="text-xl font-body text-[var(--text-secondary)] leading-relaxed opacity-80 max-w-3xl">
            FairPay removes the middleman from freelance transactions. Funds are held by 
            immutable smart contracts, releasing only when deliverable criteria are met 
            or arbitration is settled.
          </p>
      </section>

      {/* 2. Interactive Flow Section */}
      <section className="flex flex-col gap-12">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">Step 2</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Visual Settlement Logic</h2>
         </div>
         <EscrowFlowAnimation />
      </section>

      {/* 3. Dual Perspective (Client vs Freelancer) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-[var(--copper)] flex items-center justify-center font-display text-xl shadow-lg">1</div>
             <h2 className="text-2xl font-bold tracking-tight font-display uppercase">For Clients</h2>
          </div>
          <ul className="space-y-8">
            {[
              "Choose a template or define custom milestones with specific verification logic.",
              "Deposit the total project value into the Escrow Contract. Funds are locked but visible.",
              "Review incoming deliverables. Approve full release or raise a partial dispute.",
              "If you take no action, funds auto-release after the 48-hour vetting window.",
            ].map((step, i) => (
              <li key={i} className="flex gap-6 group">
                <span className="text-[10px] font-mono text-[var(--copper-dim)] group-hover:text-[var(--copper)] transition-colors mt-2">0{i+1}</span>
                <span className="text-sm font-body text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full border border-[var(--emerald)] flex items-center justify-center font-display text-xl shadow-lg">1</div>
             <h2 className="text-2xl font-bold tracking-tight font-display uppercase">For Freelancers</h2>
          </div>
          <ul className="space-y-8">
            {[
              "Browse the job board or accept a direct contract invitation from a client.",
              "Submit work by providing a verifiable hash (GitHub commit or IPFS CID).",
              "Payment initiates after the 48-hour window expires, bypassing manual approval.",
              "Partial disputes release accepted portions immediately. No more 100% lockups.",
            ].map((step, i) => (
              <li key={i} className="flex gap-6 group">
                <span className="text-[10px] font-mono text-[var(--emerald)] mt-2 opacity-40 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                <span className="text-sm font-body text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Dispute Logic visualizer */}
      <section className="card p-12 bg-[var(--bg-secondary)] border-[var(--border)] rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="flex flex-col gap-6 text-left">
              <span className="text-[10px] font-mono font-bold text-[var(--danger)] uppercase tracking-widest">Resolution Upgrade</span>
              <h2 className="text-4xl font-bold font-display leading-[1.1] uppercase tracking-tight">The Partial <br /> Dispute Innovation.</h2>
              <p className="text-base font-body text-[var(--text-secondary)] opacity-80 leading-relaxed">
                Standard escrows lock 100% of funds during a dispute. FairPay allows clients to 
                dispute only the problematic portion. If you're happy with 70% of the work, 
                that 70% releases <span className="text-[var(--accent)] font-bold italic">immediately</span>. 
                Only the contested 30% enters arbitration.
              </p>
           </div>

           <div className="relative h-64 border border-[var(--border)] bg-[var(--bg-primary)] rounded-2xl overflow-hidden p-10 flex flex-col justify-center shadow-inner">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">Milestone Value: Ξ 10.0</span>
                 <div className="badge badge--danger px-4 py-1 rounded-full text-[9px] font-bold tracking-tighter uppercase italic">30% Disputed</div>
              </div>
              <div className="w-full h-10 flex border border-white/5 rounded-full overflow-hidden mb-10 p-[2px] bg-black/20">
                 <div className="h-full bg-[var(--accent)] shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all" style={{ width: '70%' }} />
                 <div className="h-full bg-[var(--danger)] shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all" style={{ width: '30%' }} />
              </div>
              <div className="flex justify-between items-start gap-4">
                 <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                       <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-60">70% Accepted</span>
                    </div>
                    <span className="text-[var(--accent)] font-mono font-bold text-lg">Ξ 7.0 Released</span>
                 </div>
                 <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-2 justify-end">
                       <span className="text-[9px] font-mono font-bold uppercase text-right tracking-widest opacity-60">30% Contested</span>
                       <div className="w-2 h-2 bg-[var(--danger)] rounded-full text-right animate-pulse" />
                    </div>
                    <span className="text-[var(--danger)] font-mono font-bold text-lg text-right">Ξ 3.0 Locked</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-16 tracking-tight uppercase font-display text-[var(--text-secondary)]">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 text-left">
           {[
             { q: "Is FairPay truly decentralized?", a: "Yes. All funds are held in the FairPayEscrow.sol smart contract. No team members or admins can touch your funds. Rulings are signed on-chain by registered arbitrators." },
             { q: "What happens if a client disappears?", a: "The 48-hour auto-release window is the backup. If a client doesn't approve or dispute, the contract assumes satisfaction and releases funds after the timer expires." },
             { q: "What is the arbitration bond?", a: "To prevent spam disputes, both parties must lock a small bond (0.01 ETH) when a dispute is raised. The winner receives both bonds back." },
             { q: "Can I use ERC-20 tokens?", a: "Support for USDC, USDT, and DAI is currently in staging and will be live in v1.1. Native ETH is the primary collateral for now." },
             { q: "How are arbitrators chosen?", a: "Arbitrators are registered specialists with proven Reputation NFTs in the relevant field (Coding, Design, etc.). They are randomly assigned to ensure neutrality." },
             { q: "Is the code audited?", a: "The FairPay core v1.0 protocol was audited by the community. You can view the full security report on our GitHub." },
           ].map((faq, i) => (
             <div key={i} className="flex flex-col gap-4 group">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-[var(--primary)] opacity-40 group-hover:opacity-100 transition-opacity" />
                   <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors">{faq.q}</h4>
                </div>
                <p className="text-sm font-body text-[var(--text-secondary)] opacity-70 leading-relaxed pl-4 border-l border-[var(--border)] group-hover:border-[var(--primary)] transition-all">
                   {faq.a}
                </p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
