"use client";
import React from "react";

interface ReputationCardProps {
  address: string;
  data?: {
    score: number;
    totalContracts: number;
    onTimeCount: number;
    disputeCount: number;
  } | null;
  loading?: boolean;
}

export default function ReputationCard({ address, data, loading }: ReputationCardProps) {
  const score = data?.score || 60;
  const metrics = { 
    completed: data?.totalContracts || 0, 
    onTime: data?.totalContracts ? `${Math.round((data.onTimeCount / data.totalContracts) * 100)}%` : "100%", 
    disputes: data?.disputeCount || 0 
  };
  
  const circleCircumference = 2 * Math.PI * 40;
  const strokeDashoffset = circleCircumference - (score / 100) * circleCircumference;

  if (loading) {
    return (
      <div className="border border-[var(--border)] rounded-2xl p-8 sm:p-10 bg-[var(--bg-secondary)] flex animate-pulse items-center gap-12">
        <div className="w-36 h-36 bg-[var(--bg-elevated)] rounded-full"></div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-[var(--bg-elevated)] w-3/4 rounded"></div>
          <div className="h-4 bg-[var(--bg-elevated)] w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-2xl p-8 sm:p-10 bg-[var(--bg-secondary)] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_70%)]"></div>

      <div className="relative w-36 h-36 flex items-center justify-center shrink-0 z-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="40" stroke="var(--border)" strokeWidth="8" fill="transparent" />
          <circle 
            cx="72" cy="72" r="40" stroke="var(--primary)" strokeWidth="8" fill="transparent" 
            strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-[var(--text-primary)]">{score}</span>
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest mt-1">Score</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full z-10 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start group/metric">
          <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 group-hover/metric:text-[var(--primary-light)] transition-colors">Completed</span>
          <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">{metrics.completed.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex flex-col items-center md:items-start group/metric">
          <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 group-hover/metric:text-[var(--accent-light)] transition-colors">On Time</span>
          <span className="text-3xl font-black text-[var(--accent)] tracking-tight">{metrics.onTime}</span>
        </div>
        <div className="flex flex-col items-center md:items-start group/metric">
          <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-1 group-hover/metric:text-[var(--danger)] transition-colors">Disputes</span>
          <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">{metrics.disputes.toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <div className="shrink-0 flex items-center justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0 z-10">
         <button className="btn-primary px-8 py-3.5 w-full md:w-auto">
            Hire_Freelancer
         </button>
      </div>
    </div>
  );
}
