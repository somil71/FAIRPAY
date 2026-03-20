import PartialDisputeSlider from "./PartialDisputeSlider";

export default function DisputePanel({ milestone }: { milestone: any }) {
  return (
    <section className="bg-warning/10 border border-warning/30 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <svg className="w-32 h-32 text-warning" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.83L19.5 19h-15L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
      </div>

      <div className="flex items-center gap-2 text-warning mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h2 className="text-xl font-bold tracking-tight">Active Dispute</h2>
      </div>
      <p className="text-muted-foreground mb-6 max-w-xl relative z-10 leading-relaxed text-sm">
        Milestone "{milestone.title}" is currently under arbitration. An independent staked arbitrator is reviewing the evidence. The undisputed portion of the milestone has already been released.
      </p>
      
      <div className="relative z-10">
        <PartialDisputeSlider />
      </div>
      
      <div className="mt-8 pt-5 border-t border-warning/20 flex flex-wrap gap-x-8 gap-y-3 text-sm relative z-10">
        <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Arbitrator</span>
            <span className="font-mono font-medium">0x742c...123F</span>
        </div>
        <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Status</span>
            <span className="font-medium text-warning flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                {milestone.resolution?.arbitratorSigned ? "Ruling Pending Acknowledgment" : "Awaiting Evidence"}
            </span>
        </div>
      </div>

      {milestone.resolution?.arbitratorSigned && (
        <div className="mt-6 p-4 bg-background/50 border border-warning/20 rounded-lg animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold text-sm mb-2">Arbitrator Ruling Executed: {milestone.resolution.freelancerBps / 100}% to Freelancer</h3>
          <p className="text-xs text-muted-foreground mb-4">Both parties must acknowledge or it will auto-execute in {Math.max(0, Math.ceil((new Date(milestone.resolution.signatureDeadline).getTime() - Date.now()) / (1000 * 60 * 60)))} hours.</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-warning text-warning-foreground rounded text-xs font-bold hover:opacity-90">
              Acknowledge Ruling
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
