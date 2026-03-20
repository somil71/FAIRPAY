"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { login, logout, isAuthenticating, isAuthenticated } = useAuth();

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch — render nothing until client-side
  if (!mounted) {
    return (
      <button className="px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest bg-white/5 text-[var(--text-muted)] border border-white/10 animate-pulse min-w-[140px] h-10 uppercase" disabled>
        Initializing...
      </button>
    );
  }

  if (isConnected && address) {
    if (!isAuthenticated) {
      return (
        <button
          onClick={login}
          disabled={isAuthenticating}
          className="relative px-8 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] bg-[var(--primary)] text-[var(--bg-dark)] border border-[var(--primary)] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300 disabled:opacity-50 uppercase"
        >
          {isAuthenticating ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Checking...
            </span>
          ) : "Authorize Session"}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(34,197,94,0.5)] animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--text-primary)] uppercase">{address.slice(0, 6)}…{address.slice(-4)}</span>
        </div>
        <button
          onClick={logout}
          className="p-2.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent hover:border-[var(--border)] transition-all duration-200"
          title="Sign Out"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-8 py-2.5 rounded-full text-[10px] font-bold tracking-[0.3em] bg-transparent text-[var(--text-primary)] border border-[var(--primary)] shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:bg-[var(--primary)] hover:text-[var(--bg-dark)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-500 uppercase"
    >
      Connect Wallet
    </button>
  );
}
