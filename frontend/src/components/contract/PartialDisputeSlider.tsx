"use client";
import { useState } from "react";

export default function PartialDisputeSlider() {
  const [val, setVal] = useState(40);
  
  return (
    <div className="bg-background rounded-lg p-5 border shadow-sm">
      <h4 className="font-bold mb-1 tracking-tight">Disputed Percentage</h4>
      <p className="text-sm text-muted-foreground mb-4">The client disputed {val}% of this milestone. The remaining {100-val}% has bypassed lockup.</p>
      
      <div className="h-7 w-full rounded-full overflow-hidden flex bg-success shadow-inner border">
        <div className="h-full bg-warning transition-all flex items-center justify-end pr-3 text-xs font-bold text-warning-foreground relative overflow-hidden" style={{ width: `${val}%` }}>
          <div className="absolute inset-0 bg-white/20 w-full" style={{ background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' }}></div>
          {val}% Locked
        </div>
        <div className="h-full flex-1 transition-all flex items-center pl-3 text-xs font-bold text-success-foreground">
          {100-val}% Released
        </div>
      </div>
    </div>
  );
}
