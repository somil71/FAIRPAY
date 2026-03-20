import MilestoneCard from "./MilestoneCard";

export default function MilestoneTimeline({ milestones }: { milestones: any[] }) {
  return (
    <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
      {milestones.map((m, i) => (
        <div key={m.id} className="relative pl-6">
          <div className={`absolute -left-[11px] top-5 w-5 h-5 rounded-full border-4 border-card transition-colors duration-500
            ${m.status === 4 ? 'bg-success' : m.status === 2 ? 'bg-warning' : m.status === 1 ? 'bg-pending' : 'bg-muted-foreground'}`} 
          />
          <MilestoneCard milestone={m} index={i} />
        </div>
      ))}
    </div>
  );
}
