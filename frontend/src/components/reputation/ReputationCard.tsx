"use client";

export default function ReputationCard({ address }: { address: string }) {
  // Mock data
  const score = 88;
  const metrics = { completed: 12, onTime: "95%", disputes: 0 };
  
  const circleCircumference = 2 * Math.PI * 40;
  const strokeDashoffset = circleCircumference - (score / 100) * circleCircumference;

  return (
    <div className="border rounded-2xl p-8 sm:p-10 bg-card shadow-sm flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent"></div>

      <div className="relative w-36 h-36 flex items-center justify-center shrink-0 z-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted border" />
          <circle 
            cx="72" cy="72" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black">{score}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Score</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full z-10 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start group">
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">Completed</span>
          <span className="text-3xl font-black tracking-tight text-foreground">{metrics.completed}</span>
        </div>
        <div className="flex flex-col items-center md:items-start group">
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">On Time</span>
          <span className="text-3xl font-black text-success tracking-tight">{metrics.onTime}</span>
        </div>
        <div className="flex flex-col items-center md:items-start group">
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-foreground transition-colors">Disputes</span>
          <span className="text-3xl font-black tracking-tight text-foreground">{metrics.disputes}</span>
        </div>
      </div>
      
      <div className="shrink-0 flex items-center justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0 z-10">
         <button className="w-full md:w-auto px-8 py-3.5 hover:bg-primary/90 bg-primary text-primary-foreground font-bold tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
            Hire Freelancer
         </button>
      </div>
    </div>
  );
}
