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
      <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground animate-pulse min-w-[140px] h-10" disabled>
        Loading…
      </button>
    );
  }

  if (isConnected && address) {
    if (!isAuthenticated) {
      return (
        <button
          onClick={login}
          disabled={isAuthenticating}
          className="relative px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 disabled:opacity-50"
        >
          {isAuthenticating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Signing…
            </span>
          ) : "Sign In"}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/50 border border-border/50">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-mono font-medium">{address.slice(0, 6)}…{address.slice(-4)}</span>
        </div>
        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          title="Disconnect"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 glow-primary transition-all duration-300 shadow-lg"
    >
      Connect Wallet
    </button>
  );
}
