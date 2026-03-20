"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import { DEMO_STEPS } from "@/data/demoScript";
import { useRouter } from "next/navigation";
import DemoSpotlight from "./DemoSpotlight";

export default function DemoPanel() {
  const router = useRouter();
  const { isDemoMode, demoStep, setDemoStep, toggleDemoMode, resetDemoState } = useAppStore();
  
  if (!isDemoMode) return null;

  const currentStep = DEMO_STEPS.find(s => s.id === demoStep) || DEMO_STEPS[0];

  const handleNext = () => {
    if (demoStep < DEMO_STEPS.length) {
      const nextStep = DEMO_STEPS.find(s => s.id === demoStep + 1);
      if (nextStep?.action) nextStep.action();
      if (nextStep?.route) {
        router.push(nextStep.route);
      }
      setDemoStep(demoStep + 1);
    } else {
      toggleDemoMode();
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      const prevStep = DEMO_STEPS.find(s => s.id === demoStep - 1);
      if (prevStep?.action) prevStep.action();
      if (prevStep?.route) {
        router.push(prevStep.route);
      }
      setDemoStep(demoStep - 1);
    }
  };

  const handleReset = () => {
    resetDemoState();
    router.push(DEMO_STEPS[0].route);
  };

  return (
    <>
      <DemoSpotlight selector={currentStep.highlightSelector} isActive={isDemoMode} />
      
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xl px-4"
        >
          <div className="bg-[var(--bg-elevated)] border-2 border-[var(--primary)] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            {/* Animated Glow Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-3xl pointer-events-none" />
            
            <header className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[var(--primary)] uppercase tracking-[0.4em]">Judge Guided Demo</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">Step {demoStep} of {DEMO_STEPS.length}</span>
            </header>

            <div className="flex flex-col gap-4 mb-8">
              <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">
                {currentStep.title}
              </h3>
              <p className="text-sm font-body text-[var(--text-secondary)] leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <footer className="flex justify-between items-center gap-6 border-t border-[var(--border)] pt-6">
              <button 
                onClick={handleReset}
                className="text-[10px] font-mono font-bold text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors uppercase tracking-widest"
              >
                Reset Demo
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={handlePrev}
                  disabled={demoStep === 1}
                  className="px-6 py-2 rounded-full border border-[var(--border)] text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-20 hover:bg-white/5 transition-all"
                >
                  ← Back
                </button>
                <button 
                  onClick={handleNext}
                  className="px-8 py-2 rounded-full bg-[var(--primary)] text-[var(--bg-dark)] text-[10px] font-mono font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  {demoStep === DEMO_STEPS.length ? "Finish Demo ✓" : "Continue →"}
                </button>
              </div>
            </footer>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
