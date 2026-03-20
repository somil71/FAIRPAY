import React from "react";
import { contractHelpers } from "@/lib/contractHelpers";

interface AmountDisplayProps {
  amount: bigint | string | number;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  type?: "incoming" | "outgoing" | "locked";
}

export default function AmountDisplay({ 
  amount, 
  label, 
  size = "md",
  type = "locked"
}: AmountDisplayProps) {
  const formatted = contractHelpers.formatWei(amount);
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  const typeClasses = {
    incoming: "text-[var(--emerald)]",
    outgoing: "text-[var(--crimson)]",
    locked: "text-[var(--amber)]",
  };

  return (
    <div className="flex flex-col">
      {label && (
        <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 leading-none">
          {label}
        </span>
      )}
      <div className={`flex items-baseline gap-2 font-mono font-medium ${sizeClasses[size]} ${typeClasses[type]}`}>
        <span className="opacity-70 text-xs text-[var(--text-secondary)]">Ξ</span>
        <span className="tracking-tight">{formatted}</span>
      </div>
      {/* Muted USD estimate for reference */}
      <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 tracking-tight">
        EST_VAL: ${(parseFloat(formatted) * 2500).toLocaleString()} USD
      </span>
    </div>
  );
}
