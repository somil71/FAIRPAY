import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'active' | 'pending' | 'released' | 'disputed' | 'none' | 'success' | 'danger' | 'warning' | 'info';
}

export const Badge = ({ children, className = "", variant = 'none' }: BadgeProps) => {
  const variantClasses = {
    active: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30',
    pending: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30',
    released: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30',
    disputed: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30',
    none: 'bg-white/5 text-[var(--text-muted)] border-white/10',
    success: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30',
    danger: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30',
    warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30',
    info: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-widest ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
