"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Component: VerificationSuite
 * Purpose: Handles GitHub Commit and IPFS CID verification UI.
 */
export default function VerificationSuite({ onVerify }: { onVerify: (hash: string, method: 'github' | 'ipfs') => void }) {
  const [method, setMethod] = useState<'github' | 'ipfs'>('github');
  const [inputValue, setInputValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate on-chain/webhook verification delay
    await new Promise(r => setTimeout(r, 2000));
    onVerify(inputValue, method);
    setIsVerifying(false);
  };

  return (
    <div className="card p-8 bg-[var(--bg-base)] border-[var(--border-subtle)] flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
         <span className="text-[10px] font-mono font-bold text-[var(--copper)] uppercase tracking-[0.4em]">VERIFICATION_GATEWAY</span>
         <div className="flex bg-[var(--void)] p-1 rounded-sm border border-[var(--border-subtle)]">
            <button 
              onClick={() => setMethod('github')}
              className={`px-4 py-1.5 text-[9px] font-mono font-bold tracking-widest transition-all ${method === 'github' ? 'bg-[var(--copper)] text-[var(--void)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              GITHUB
            </button>
            <button 
              onClick={() => setMethod('ipfs')}
              className={`px-4 py-1.5 text-[9px] font-mono font-bold tracking-widest transition-all ${method === 'ipfs' ? 'bg-[var(--copper)] text-[var(--void)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              IPFS
            </button>
         </div>
      </div>

      <div className="flex flex-col gap-4">
         <label className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">
           {method === 'github' ? 'ENTER_COMMIT_SHA_HASH' : 'ENTER_IPFS_CONTENT_ID'}
         </label>
         <div className="flex gap-4">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={method === 'github' ? 'e.g. 7421f0b...' : 'e.g. QmXoyp...'}
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] p-3 rounded-sm text-sm font-mono focus:border-[var(--copper)] outline-none transition-colors"
            />
            <button 
              onClick={handleVerify}
              disabled={!inputValue || isVerifying}
              className="btn-primary py-3 px-8 text-[10px] disabled:opacity-20 flex items-center gap-2"
            >
              {isVerifying ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border-2 border-[var(--void)] border-t-transparent rounded-full"
                />
              ) : 'TRANSMIT'}
            </button>
         </div>
      </div>

      <div className="bg-[var(--bg-deep)] p-4 rounded-sm border border-[var(--border-subtle)]/50">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 bg-[var(--copper)] rounded-full" />
            <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest">PROTOCOL_HINT</span>
         </div>
         <p className="text-[9px] font-body text-[var(--text-secondary)] opacity-60 leading-relaxed">
           Verification occurs via the protocol's decentralized oracle network. {method === 'github' ? 'Ensure your commit is pushed to the main branch.' : 'Ensure the CID is globally resolvable on the IPFS network.'}
         </p>
      </div>
    </div>
  );
}
