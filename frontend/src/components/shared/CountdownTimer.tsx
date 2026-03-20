"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer({ deadline }: { deadline: number }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const int = setInterval(() => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00 (Auto-release Available)");
        setIsWarning(true);
        clearInterval(int);
        return;
      }
      setIsWarning(diff < 12 * 3600000); // red pulse if < 12h
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(int);
  }, [deadline]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Time window</span>
      <span className={`font-mono bg-background px-2.5 py-1 rounded border shadow-inner font-bold ${isWarning ? 'text-destructive animate-pulse' : 'text-pending'}`}>
        {timeLeft}
      </span>
    </div>
  );
}
