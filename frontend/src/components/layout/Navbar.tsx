"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/create", label: "New Contract", icon: "✦" },
  { href: "/jobs", label: "Job Board", icon: "◈" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 glass-panel">
      <div className="container mx-auto px-8 h-20 flex items-center justify-between">
        {/* Brand Section */}
        <Link href="/" className="flex items-center gap-5 group">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-all duration-500">
            <span className="text-[var(--bg-primary)] font-black text-2xl" style={{ fontFamily: 'var(--font-display)' }}>FP</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tighter leading-none text-[var(--text-primary)] uppercase">FAIRPAY</h1>
            <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
               <span className="text-[10px] text-[var(--accent)] font-bold tracking-[0.3em] uppercase opacity-90">Protocol v1.0</span>
               <div className="h-[1px] w-8 bg-[var(--accent)]/30"></div>
            </div>
          </div>
        </Link>

        {/* Status & Wallet Hub */}
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end gap-1.5 px-6 border-r border-[var(--border)] py-1">
             <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Network Status</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
             </div>
             <span className="text-[10px] text-[var(--text-primary)] font-bold uppercase tracking-widest font-mono">Sepolia Connected</span>
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
