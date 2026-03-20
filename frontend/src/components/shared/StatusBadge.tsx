import React from "react";
import { MILESTONE_STATUS } from "@/lib/contractHelpers";

interface StatusBadgeProps {
  status: keyof typeof MILESTONE_STATUS;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = MILESTONE_STATUS[status] || MILESTONE_STATUS.PENDING;

  return (
    <div className={`badge ${config.class} flex items-center gap-1.5 px-3 py-1 font-mono font-bold tracking-widest`}>
      {/* Small dot indicator */}
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'SUBMITTED' ? 'animate-pulse' : ''}`} />
      {config.label}
    </div>
  );
}
