import React from "react";
import { contractHelpers } from "@/lib/contractHelpers";
import { useEthPrice, formatUSD } from "@/hooks/useEthPrice";
import { fromWeiString } from "@/lib/bigintUtils";

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

  const ethPrice = useEthPrice();
  const wei = fromWeiString(String(amount));

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
      {ethPrice > 0 && (
        <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 tracking-tight">
          {formatUSD(wei, ethPrice)}
        </span>
      )}
    </div>
  );
}
