"use client";
import { useState, useEffect } from "react";
import { contractHelpers } from "@/lib/contractHelpers";

interface CountdownTimerProps {
  submittedAt: bigint;
}

export default function CountdownTimer({ submittedAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      setTimeLeft(contractHelpers.secondsUntilRelease(submittedAt));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [submittedAt]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const colorClass = 
    hours >= 24 ? "text-[var(--accent-success)]" :
    hours >= 6 ? "text-[var(--accent-warning)]" :
    "text-[var(--accent-danger)] animate-pulse";

  return (
    <div className={`font-mono text-xs font-bold tracking-widest flex items-center gap-2 ${colorClass}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {hours}H {minutes}M {seconds}S
    </div>
  );
}
