"use client";
import React, { useState } from "react";
import { useAccount } from "wagmi";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile");

  if (!isConnected) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-4xl opacity-20 text-[var(--primary)]">
          ○
        </div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text-secondary)]">
          Connection Required
        </h2>
        <p className="text-sm font-body text-[var(--text-muted)] max-w-sm">
          Please connect your wallet to manage your institutional settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold text-[var(--primary-light)] uppercase tracking-[0.4em]">System Configuration v1.0</span>
        <h1 className="text-5xl font-bold tracking-tighter font-display uppercase">Settings</h1>
      </header>

      <div className="flex gap-1 border-b border-[var(--border)] pb-px">
        {(["profile", "notifications", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? "text-[var(--primary-light)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {activeTab === "profile" && (
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-secondary)] border-l-4 border-[var(--primary)] pl-4">Identity Metadata</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Display Name</label>
                   <input type="text" placeholder="Institutional Entity" className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-sm text-sm font-body focus:border-[var(--primary)] outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Wallet Address</label>
                   <div className="bg-[var(--bg-primary)] border border-[var(--border-light)] p-4 rounded-sm text-sm font-mono opacity-50 cursor-not-allowed">
                     {address}
                   </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-secondary)] border-l-4 border-[var(--accent)] pl-4">Protocol Links</h2>
              <div className="grid grid-cols-1 gap-8 mt-4">
                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">GitHub Organization</label>
                   <input type="text" placeholder="Enter organization name" className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-sm text-sm font-body focus:border-[var(--primary)] outline-none transition-colors" />
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-[var(--border)]">
              <button className="btn-primary px-12 py-4 text-[10px] uppercase font-bold tracking-widest">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-8">
              <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-secondary)] border-l-4 border-[var(--primary)] pl-4">Alert Preferences</h2>
              
              <div className="flex flex-col gap-6">
                {[
                  { label: "Milestone Submissions", desc: "Get notified when a deliverable is attached to your protocols." },
                  { label: "Capital Releases", desc: "Receive alerts when funds are authorized for transfer." },
                  { label: "Dispute Alerts", desc: "Immediate notification if a protocol reaches a conflict state." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-sm group hover:border-[var(--primary-dark)] transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{item.label}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">{item.desc}</span>
                    </div>
                    <div className="w-12 h-6 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-full relative cursor-pointer p-1">
                      <div className="w-4 h-4 bg-[var(--primary)] rounded-full shadow-[0_0_5px_var(--primary)]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "security" && (
          <div className="flex flex-col gap-10">
             <section className="card p-10 border-l-4 border-[var(--danger)] bg-[var(--bg-secondary)]">
                <h3 className="text-xl font-bold text-[var(--danger)] font-display uppercase tracking-tight">Access Control</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed opacity-80">
                  Ensure your private keys are secured. FairPay never stores your private keys or sensitive credentials. All transactions are authorized directly via your connected hardware or software wallet.
                </p>
                <button className="mt-8 px-8 py-3 bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[10px] font-mono font-bold rounded-sm hover:bg-[var(--danger)] hover:text-white transition-all uppercase tracking-widest">
                  Revoke All Access
                </button>
             </section>
          </div>
        )}
      </div>
    </div>
  );
}
