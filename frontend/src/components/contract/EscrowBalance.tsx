export default function EscrowBalance({ total, released }: { total: string, released: string }) {
  const t = parseFloat(total);
  const r = parseFloat(released);
  const locked = t - r;
  const pct = (r / t) * 100;

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Escrow Balance</h3>
      
      <div className="text-4xl font-black mb-1 text-foreground flex items-end gap-2 tracking-tight">
        {t} <span className="text-lg text-muted-foreground font-semibold mb-1">ETH Total</span>
      </div>
      
      <div className="h-4 w-full bg-muted rounded-full mt-6 mb-4 overflow-hidden flex shadow-inner">
        <div className="h-full bg-success transition-all duration-1000 relative" style={{ width: `${pct}%` }}>
          <div className="absolute inset-0 bg-white/20 w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}></div>
        </div>
        <div className="h-full bg-primary/20" style={{ flex: 1 }} />
      </div>
      
      <div className="flex justify-between flex-col gap-2 text-sm font-medium mt-6">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
            <span className="text-muted-foreground">Released</span>
          </div>
          <span className="font-bold">{r} ETH</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/40 shadow-sm"></div>
            <span className="text-muted-foreground">Locked Pending</span>
          </div>
          <span className="font-bold">{locked.toFixed(2)} ETH</span>
        </div>
      </div>
    </div>
  );
}
