export default function ReputationBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success bg-success/10" : score >= 50 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
      Rep: {score}
    </span>
  );
}
