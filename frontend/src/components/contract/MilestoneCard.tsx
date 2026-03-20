"use client";
import VerificationBadge from "./VerificationBadge";
import ReleaseAnimation from "./ReleaseAnimation";
import CountdownTimer from "../shared/CountdownTimer";

export default function MilestoneCard({ milestone, index }: { milestone: any, index: number }) {
  const statusColors: any = {
    0: "border-border shadow-sm",
    1: "border-pending/50 bg-pending/5 shadow-md",
    2: "border-warning/50 bg-warning/5 shadow-md",
    3: "border-warning/50 bg-warning/5 shadow-md",
    4: "border-success/50 bg-success/5 shadow-md",
    5: "border-destructive/50 bg-destructive/5 shadow-sm"
  };

  return (
    <div className={`p-5 rounded-xl border ${statusColors[milestone.status]} transition-all relative overflow-hidden group`}>
      {milestone.status === 4 && <ReleaseAnimation />}
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h4 className="font-bold text-lg text-foreground flex items-center gap-2 tracking-tight">
            M{index + 1}: {milestone.title}
          </h4>
          <VerificationBadge type="GitHub" />
        </div>
        <div className="text-right">
          <div className="font-black text-xl text-foreground mb-0.5">{milestone.amount} <span className="text-sm font-semibold text-muted-foreground">ETH</span></div>
          {milestone.status === 0 && <span className="text-[10px] tracking-wide uppercase font-bold text-muted-foreground">Pending</span>}
          {milestone.status === 1 && <span className="text-[10px] tracking-wide uppercase font-bold text-pending">Submitted</span>}
          {milestone.status === 2 && <span className="text-[10px] tracking-wide uppercase font-bold text-warning">Disputed</span>}
          {milestone.status === 4 && <span className="text-[10px] tracking-wide uppercase font-bold text-success">Released</span>}
        </div>
      </div>
      
      {milestone.status === 1 && (
        <div className="mt-5 pt-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <CountdownTimer deadline={Date.now() + 48*3600*1000} />
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 hover:bg-warning/90 bg-warning text-warning-foreground rounded-md text-sm font-semibold transition-colors shadow-sm">Dispute</button>
            <button className="flex-1 sm:flex-none px-4 py-2 hover:bg-success/90 bg-success text-success-foreground rounded-md text-sm font-semibold transition-colors shadow-sm">Approve</button>
          </div>
        </div>
      )}
    </div>
  );
}
