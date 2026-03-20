"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole]               = useState<'client'|'freelancer'|'both'>('client');
  const [specialty, setSpecialty]     = useState('');
  const [github, setGithub]           = useState('');
  const { registerUser, txPending, currentUser } = useAppStore();
  const router = useRouter();

  // If already registered, redirect to dashboard
  useEffect(() => {
    if (currentUser.isRegistered) router.push('/dashboard');
  }, [currentUser.isRegistered, router]);

  const handleRegister = async () => {
    if (!displayName.trim()) return;
    await registerUser({ displayName, role, specialty, github });
    router.push('/dashboard');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate"
      className="max-w-xl mx-auto py-20"
    >
      <div className="mb-10 text-center">
        <span className="text-[10px] font-mono font-black text-[var(--copper)] uppercase tracking-[0.4em]">
          PROTOCOL_ONBOARDING
        </span>
        <h1 className="text-4xl font-bold font-display tracking-tight text-[var(--text-primary)] mt-2">
          Create Your Account
        </h1>
        <p className="text-[var(--text-secondary)] mt-4 font-mono text-sm max-w-md mx-auto">
          Establish your professional identity on the FairPay decentralized network.
        </p>
      </div>

      <div className="card p-8 bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -top-12 -right-12 text-[120px] font-display font-bold text-[var(--text-primary)] opacity-[0.02] pointer-events-none">
          FP
        </div>

        {/* Wallet — already connected, shown read-only */}
        <div className="flex flex-col gap-2 mb-8">
          <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Your Wallet</label>
          <div className="flex items-center justify-between p-4 bg-[var(--void)] border border-[var(--border)] rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
              <span className="font-mono text-xs text-[var(--text-primary)]">{currentUser.shortAddr}</span>
            </div>
            <Badge variant="active">Connected</Badge>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Display name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Display Name</label>
            <input
              className="w-full bg-[var(--void)] border border-[var(--border)] rounded-sm px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--warning)] outline-none transition-all"
              placeholder="e.g. Alex Chen"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={40}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Primary Role</label>
            <div className="grid grid-cols-3 gap-3">
              {(['client', 'freelancer', 'both'] as const).map(r => (
                <motion.button
                  key={r}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    py-3 text-[10px] font-mono font-bold uppercase tracking-widest border transition-all rounded-sm
                    ${role === r ? 'border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/5' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'}
                  `}
                  onClick={() => setRole(r)}
                >
                  {r === 'client'     && '⊡ Client'}
                  {r === 'freelancer' && '◎ Freelancer'}
                  {r === 'both'       && '⊕ Both'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Specialty — shown if freelancer or both */}
          {(role === 'freelancer' || role === 'both') && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Specialty</label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Content">Content Writing</SelectItem>
                  <SelectItem value="Smart Contracts">Smart Contracts</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* GitHub */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">GitHub (optional)</label>
            <input
              className="w-full bg-[var(--void)] border border-[var(--border)] rounded-sm px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--warning)] outline-none transition-all"
              placeholder="github.com/username"
              value={github}
              onChange={e => setGithub(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className={`
              w-full py-4 mt-4 text-[11px] font-mono font-black uppercase tracking-[0.2em] transition-all rounded-sm
              ${(!displayName.trim() || txPending) ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--warning)] text-black hover:scale-[1.02] shadow-[0_10px_20px_rgba(245,158,11,0.2)]'}
            `}
            disabled={!displayName.trim() || txPending}
            onClick={handleRegister}
          >
            {txPending ? 'INITIALIZING_PROFILE...' : 'Register Account →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
