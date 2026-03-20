"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import WalletButton from "./WalletButton";
import { useAccount, useDisconnect } from "wagmi";
import { contractHelpers } from "@/lib/contractHelpers";
import { useAppStore } from "@/store/appStore";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  section?: string;
  highlight?: boolean;
}

const NAVIGATION: NavItem[] = [
  // SECTION: CORE
  { label: "Home", href: "/", icon: "⌂", section: "NAVIGATION" },
  { label: "How It Works", href: "/how-it-works", icon: "≡" },
  { label: "Job Board", href: "/jobs", icon: "◷" },
  { label: "Arbitration", href: "/arbitrate", icon: "⚖" },
  
  // SECTION: ACCOUNT
  { label: "Dashboard", href: "/dashboard", icon: "▣", section: "MY ACCOUNT" },
  { label: "My Contracts", href: "/contracts", icon: "⊞" },
  { label: "Settings", href: "/settings", icon: "○" },
  
  // SECTION: TOOLS
  { label: "New Contract", href: "/create", icon: "✦", section: "TOOLS", highlight: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const isDemoMode = useAppStore(s => s.isDemoMode);
  const { disconnect } = useDisconnect();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[var(--bg-deep)] border-r border-[var(--border-subtle)] flex flex-col z-50">
      {/* Brand Section */}
      <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <Link href="/" className="flex flex-col gap-1 group">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-[var(--bg-primary)] font-display font-bold text-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
               FP
             </div>
             <span className="font-display text-2xl font-bold tracking-tighter text-[var(--text-primary)] group-hover:text-[var(--primary-light)] transition-colors">
               FAIRPAY
             </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 font-bold">
             Decentralized Escrow
          </span>
        </Link>
      </div>

      {/* Wallet Status / Identity */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
        {isConnected ? (
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-widest uppercase">Identity Link</span>
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(34,197,94,0.5)] animate-pulse" />
             </div>
             <div className="flex flex-col">
                <span className="font-mono text-sm text-[var(--text-primary)] font-bold">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </span>
                <span className="text-[11px] font-mono text-[var(--primary-light)] font-bold mt-2">
                  Ξ 1.240 <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Available</span>
                </span>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
             <span className="text-[8px] font-mono font-bold text-[var(--text-muted)] tracking-widest uppercase mb-1">Not Connected</span>
             <WalletButton />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
        {NAVIGATION.reduce((acc: React.ReactNode[], item) => {
          if (item.section) {
            acc.push(
              <div key={`section-${item.section}`} className="px-4 py-2 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {item.section}
              </div>
            );
          }
          
          const isActive = pathname === item.href;
          
          acc.push(
            <Link 
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 relative overflow-hidden
                ${isActive ? 'text-[var(--text-primary)] bg-[var(--bg-raised)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]'}
                ${item.highlight ? 'mt-4 border border-[var(--acid)]/30 bg-[var(--acid-dim)]/10 text-[var(--acid)] mb-4' : ''}
              `}
            >
              {/* Active Accent Bar */}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--primary)] shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                />
              )}
              
              <span className={`text-lg opacity-80 ${item.highlight ? 'text-[var(--acid)]' : ''}`}>
                {item.icon}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest uppercase ${item.highlight ? 'text-[var(--acid)]' : ''}`}>
                {item.label}
              </span>
              
              {item.highlight && (
                <div className="absolute top-0 right-0 p-1">
                   <div className="w-1.5 h-1.5 bg-[var(--acid)] rounded-full animate-ping" />
                </div>
              )}
            </Link>
          );
          return acc;
        }, [])}
      </nav>

      {/* Footer / Logout / Demo */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--void)]/50 flex flex-col gap-2">
         <button 
           onClick={() => useAppStore.getState().toggleDemoMode()}
           className={`w-full flex items-center justify-between px-4 py-2 text-[10px] font-mono font-bold transition-all border ${isDemoMode ? 'border-[var(--acid)] text-[var(--acid)] bg-[var(--acid)]/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'} uppercase tracking-[0.2em]`}
         >
           {isDemoMode ? 'Exit Demo' : 'Demo Mode'}
           <span className="text-xs">{isDemoMode ? '⏹' : '▶'}</span>
         </button>
         
         {isConnected && (
            <button 
              onClick={() => disconnect()}
              className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-mono font-bold text-[var(--text-muted)] hover:text-[var(--crimson)] transition-colors uppercase tracking-[0.2em]"
            >
               Disconnect Wallet
               <span className="text-xs">⊘</span>
            </button>
         )}
      </div>
    </aside>
  );
}
