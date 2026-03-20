"use client";
import BidForm from "./BidForm";

export default function JobCard({ job }: { job: any }) {
  const formattedBudget = `$${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`;
  const daysLeft = Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5 font-bold text-success tracking-wide">
              {job._count?.bids || 0} Bids
            </span>
            <span className="font-medium">• {job.workType}</span>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="font-bold text-foreground bg-accent/50 px-3 py-1 rounded inline-block sm:block sm:bg-transparent sm:p-0">{formattedBudget}</div>
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-2 sm:mt-1">{daysLeft} days left</div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
      
      <div className="flex justify-between items-center border-t pt-5 mt-3">
        <div className="text-sm text-foreground/80 font-bold tracking-wide">
          {job.milestoneCount} <span className="font-medium text-muted-foreground">Verifiable Milestones</span>
        </div>
        <BidForm jobTitle={job.title} jobId={job.id} />
      </div>
    </div>
  );
}
