"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Page: Landing (Root)
 * Aesthetic: SecureGlow Dark — Trust & Security
 * Purpose: Conversion & Brand Experience
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col gap-32">
      {/* 1. HERO SECTION */}
      <section className="relative py-20 overflow-hidden">
        {/* Modern Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-[var(--accent)] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col max-w-5xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="h-[2px] w-12 bg-gradient-to-r from-[var(--primary)] to-transparent" />
            <span className="text-[11px] font-mono font-bold text-[var(--primary-light)] uppercase tracking-[0.4em]">
              FairPay Protocol v1.0
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-10"
          >
            Escrow Built on <br />
            <span className="text-gradient">Verifiable Trust.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-body text-[var(--text-secondary)] leading-relaxed mb-12 max-w-3xl opacity-90"
          >
            Secure, multi-milestone payments for modern teams. Funds move when 
            deliverables are verified on-chain. <span className="text-[var(--primary-light)] font-semibold">No intermediaries, total transparency.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6"
          >
            <Link href="/create" className="btn-primary flex items-center gap-4 px-10 group bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)]">
              <span className="tracking-widest uppercase font-bold text-xs">Start a Contract</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/how-it-works" className="btn-secondary px-10 border-[var(--border-light)] hover:bg-[var(--bg-elevated)] transition-all uppercase font-bold text-xs tracking-widest">
              Explore Protocol
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. LIVE STATS BAR (Modern Glass) */}
      <section className="py-12 border-y border-[var(--border)] relative glass-card rounded-2xl mx-[-1rem] px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {[
            { label: "PROTOCOL ESCROW", val: "Ξ 234.7", color: "text-[var(--primary-light)]" },
            { label: "VERIFIED MILESTONES", val: "2,341", color: "text-[var(--accent)]" },
            { label: "ACTIVE ARBITRATORS", val: "148", color: "text-[var(--primary)]" },
            { label: "DISPUTE SETTLEMENT", val: "99.7%", color: "text-[var(--accent-light)]" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold tracking-tight ${stat.color}`}>{stat.val}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE PROTOCOL FLOW (Modern Icons) */}
      <section className="py-12">
        <div className="flex flex-col gap-4 mb-20">
          <span className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.4em]">System Architecture</span>
          <h2 className="text-4xl font-bold tracking-tight uppercase">The Secure Path</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[3rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />
          
          {[
            { 
              step: "01", 
              title: "On-Chain Commitment", 
              desc: "Funds are locked in a singleton vault. Terms are signed by both parties at contract initialization.",
              bg: "bg-[var(--primary)]/10 text-[var(--primary)]" 
            },
            { 
              step: "02", 
              title: "Proof of Delivery", 
              desc: "Freelancer submits artifacts. Automated nodes verify content hashes (IPFS/Arweave).",
              bg: "bg-[var(--accent)]/10 text-[var(--accent)]" 
            },
            { 
              step: "03", 
              title: "Instant Settlement", 
              desc: "Upon verification, funds unlock directly. No manual invoicing or wire delays.",
              bg: "bg-[var(--primary-light)]/10 text-[var(--primary-light)]" 
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center px-6">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-8 relative border border-transparent hover:border-[var(--primary)]/30 transition-all ${item.bg} shadow-lg shadow-black/40`}>
                <span className="text-3xl font-bold font-mono">{item.step}</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed opacity-80">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECURITY HIGHLIGHTS */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              title: "Multi-Sig Arbitration", 
              desc: "3-of-3 expert consensus for dispute resolution. Impartial, fast, and final.",
              icon: "🛡",
              tag: "Security v2"
            },
            { 
              title: "Reputation Oracle", 
              desc: "Build portable trust with every successful payment. Meritocracy on the ledger.",
              icon: "💎",
              tag: "Trust Protocol"
            },
            { 
              title: "Smart Disbursement", 
              desc: "Programmatic fund release prevents exit scams and ensures project continuity.",
              icon: "⚙",
              tag: "Ledger Logic"
            },
            { 
              title: "Privacy First", 
              desc: "Briefs and artifacts are encrypted. Only hashes live on the public blockchain.",
              icon: "🔒",
              tag: "AES Encryption"
            },
          ].map((f, i) => (
            <div key={i} className="card p-10 flex flex-col gap-6 group hover:border-[var(--primary)]/40 transition-all rounded-3xl">
               <div className="flex justify-between items-center">
                 <span className="text-4xl">{f.icon}</span>
                 <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] border border-[var(--primary)]/20 px-4 py-1.5 rounded-lg bg-[var(--primary)]/5 uppercase">{f.tag}</span>
               </div>
               <div className="flex flex-col gap-2">
                 <h4 className="text-2xl font-bold uppercase tracking-tight">{f.title}</h4>
                 <p className="text-base text-[var(--text-secondary)] opacity-80 leading-relaxed font-body">
                   {f.desc}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] rounded-3xl border border-[var(--border)] text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
            <span className="text-[11px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.5em] mb-10">
              Join the Decentralized Economy
            </span>
            <h2 className="text-5xl md:text-7xl font-bold mb-14 tracking-tight max-w-4xl uppercase">
              Ready to secure your <br /> <span className="text-gradient">next professional sprint?</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-8">
               <Link href="/create" className="btn-primary px-16 py-6 text-xl font-bold uppercase tracking-widest shadow-2xl">
                 Get Started
               </Link>
               <Link href="/jobs" className="btn-secondary px-16 py-6 text-xl font-bold uppercase tracking-widest border-[var(--border-light)]">
                 Find a Job
               </Link>
            </div>
        </div>
      </section>

      {/* 6. MODERN FOOTER */}
      <footer className="py-20 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-start gap-12 text-[var(--text-muted)]">
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold shadow-lg">FP</div>
             <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter uppercase">FAIRPAY</span>
           </div>
           <p className="text-sm max-w-xs opacity-70 leading-relaxed italic">
             "The institutional standard for verifiable professional trust on the Ethereum network."
           </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-[0.3em]">Protocol</span>
            <Link href="/how-it-works" className="text-sm hover:text-[var(--primary-light)] transition-colors">Architecture</Link>
            <Link href="/create" className="text-sm hover:text-[var(--primary-light)] transition-colors">Launch a Node</Link>
            <Link href="/arbitrate" className="text-sm hover:text-[var(--primary-light)] transition-colors">Justice Hub</Link>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-[0.3em]">Resources</span>
            <Link href="/docs" className="text-sm hover:text-[var(--primary-light)] transition-colors">Documentation</Link>
            <Link href="https://github.com/somil71" className="text-sm hover:text-[var(--primary-light)] transition-colors">Open Source</Link>
            <Link href="/terms" className="text-sm hover:text-[var(--primary-light)] transition-colors">Trust Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
