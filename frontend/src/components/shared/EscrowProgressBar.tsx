"use client";
import { motion } from "framer-motion";

interface MilestoneSummary {
  status: "Pending" | "Submitted" | "Released" | "Disputed";
}

interface EscrowProgressBarProps {
  milestones: MilestoneSummary[];
}

export default function EscrowProgressBar({ milestones }: EscrowProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
         <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest uppercase">ESCROW_PROGRESS_BAR</span>
         <span className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
            {milestones.filter(m => m.status === "Released").length} / {milestones.length} COMPLETE
         </span>
      </div>
      <div className="progress-segmented">
        {milestones.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`progress-segment ${m.status.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
