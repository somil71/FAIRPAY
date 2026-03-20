"use client";
import { useState } from "react";
import { useCreateContract } from "@/hooks/useCreateContract";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneData {
  title: string;
  description: string;
  paymentBps: number;
  verificationMethod: number;
  deadline: number;
}

const stepLabels = ["Basics", "Milestones", "Review"];

export default function CreateWizard() {
  const [step, setStep] = useState(1);
  const { createContract, isLoading, error } = useCreateContract();
  const [formData, setFormData] = useState<{
    freelancer: string;
    amount: string;
    repo: string;
    brief: string;
    milestones: MilestoneData[];
  }>({
    freelancer: "",
    amount: "",
    repo: "",
    brief: "",
    milestones: [],
  });

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const submit = async () => {
    await createContract(formData);
  };

  const totalBps = formData.milestones.reduce((sum, m) => sum + m.paymentBps, 0);

  const slideVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {stepLabels.map((label, i) => {
          const num = i + 1;
          const isActive = step >= num;
          const isCurrent = step === num;
          return (
            <div key={label} className="flex items-center gap-3 flex-1">
              <div className={`flex items-center gap-2.5 transition-all duration-300 ${isCurrent ? "scale-105" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {num}
                </div>
                <span className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-px transition-colors duration-300 ${step > num ? "bg-purple-500/50" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className="glass-card rounded-2xl p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Basics */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Contract Basics</h2>
                <p className="text-sm text-muted-foreground">Set up the core parameters of your escrow agreement.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Freelancer Wallet Address</label>
                <input
                  className="p-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-mono placeholder:text-muted-foreground/50 focus:bg-muted/80 transition-colors"
                  placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                  value={formData.freelancer}
                  onChange={e => setFormData({...formData, freelancer: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Total Amount (ETH)</label>
                  <div className="relative">
                    <input
                      className="w-full p-3 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:bg-muted/80 transition-colors pr-12"
                      placeholder="0.05"
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ETH</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">GitHub Repo <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    className="p-3 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:bg-muted/80 transition-colors"
                    placeholder="owner/repo"
                    value={formData.repo}
                    onChange={e => setFormData({...formData, repo: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Project Brief</label>
                <textarea
                  className="p-3 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:bg-muted/80 transition-colors min-h-[100px] resize-none"
                  placeholder="Describe the scope of work, expected deliverables, and timeline…"
                  value={formData.brief}
                  onChange={e => setFormData({...formData, brief: e.target.value})}
                />
              </div>

              <button onClick={handleNext} className="mt-2 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 glow-primary transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
                Next: Define Milestones
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </motion.div>
          )}

          {/* STEP 2: Milestones */}
          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Milestones</h2>
                  <p className="text-sm text-muted-foreground">Break your project into verifiable deliverables.</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${totalBps === 10000 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                  {(totalBps / 100).toFixed(0)}% / 100%
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                {formData.milestones.map((m, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted/30 border border-border/50 relative group hover:border-purple-500/30 transition-colors">
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-card border border-border/50 rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Milestone {i + 1}
                    </div>
                    <button
                      onClick={() => {
                        const newM = [...formData.milestones];
                        newM.splice(i, 1);
                        setFormData({...formData, milestones: newM});
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/20 text-destructive"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="grid grid-cols-1 gap-3 mt-1">
                      <input
                        placeholder="Milestone title (e.g. UI Wireframes)"
                        className="p-2.5 rounded-lg bg-card/50 border border-border/30 text-sm placeholder:text-muted-foreground/40"
                        value={m.title}
                        onChange={e => {
                          const newM = [...formData.milestones];
                          newM[i] = { ...newM[i], title: e.target.value };
                          setFormData({...formData, milestones: newM});
                        }}
                      />
                      <textarea
                        placeholder="Requirements and deliverables…"
                        className="p-2.5 rounded-lg bg-card/50 border border-border/30 text-xs min-h-[50px] resize-none placeholder:text-muted-foreground/40"
                        value={m.description}
                        onChange={e => {
                          const newM = [...formData.milestones];
                          newM[i] = { ...newM[i], description: e.target.value };
                          setFormData({...formData, milestones: newM});
                        }}
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Payment %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="25"
                            className="w-full p-2 rounded-lg bg-card/50 border border-border/30 text-sm"
                            value={m.paymentBps === 0 ? "" : m.paymentBps / 100}
                            onChange={e => {
                              const newM = [...formData.milestones];
                              newM[i] = { ...newM[i], paymentBps: Math.max(0, Number(e.target.value)) * 100 };
                              setFormData({...formData, milestones: newM});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Days</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="7"
                            className="w-full p-2 rounded-lg bg-card/50 border border-border/30 text-sm"
                            value={m.deadline === 0 ? "" : Math.ceil(m.deadline / 86400)}
                            onChange={e => {
                              const newM = [...formData.milestones];
                              const days = Math.max(0, Number(e.target.value));
                              newM[i] = { ...newM[i], deadline: days * 86400 };
                              setFormData({...formData, milestones: newM});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Verify</label>
                          <select
                            className="w-full p-2 rounded-lg bg-card/50 border border-border/30 text-sm"
                            value={m.verificationMethod}
                            onChange={e => {
                              const newM = [...formData.milestones];
                              newM[i] = { ...newM[i], verificationMethod: Number(e.target.value) };
                              setFormData({...formData, milestones: newM});
                            }}
                          >
                            <option value={0}>Multi-sig</option>
                            <option value={1}>GitHub</option>
                            <option value={2}>IPFS</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setFormData({...formData, milestones: [...formData.milestones, { title: "", description: "", paymentBps: 0, verificationMethod: 0, deadline: 0 }]})}
                  className="p-4 border border-dashed border-border/50 rounded-xl hover:bg-accent/30 hover:border-purple-500/30 transition-all duration-200 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add Milestone
                </button>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={handlePrev} className="flex-1 h-12 rounded-xl border border-border/50 font-semibold text-sm hover:bg-accent/50 transition-all">Back</button>
                <button
                  onClick={handleNext}
                  disabled={totalBps !== 10000 || formData.milestones.length === 0}
                  className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 glow-primary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Review & Deploy
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Review & Deploy</h2>
                <p className="text-sm text-muted-foreground">Confirm your contract details before deploying to the blockchain.</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/30 divide-y divide-border/30">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Freelancer</span>
                  <span className="text-sm font-mono font-medium">{formData.freelancer ? `${formData.freelancer.slice(0,8)}…${formData.freelancer.slice(-6)}` : "—"}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Escrow</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{formData.amount || "0"} ETH</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">GitHub</span>
                  <span className="text-sm">{formData.repo || "None"}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Milestones</span>
                  <span className="text-sm font-medium">{formData.milestones.length} defined</span>
                </div>
              </div>

              {formData.milestones.length > 0 && (
                <div className="flex flex-col gap-2">
                  {formData.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i+1}</div>
                      <span className="text-sm font-medium flex-1 truncate">{m.title || "Untitled"}</span>
                      <span className="text-xs text-muted-foreground">{(m.paymentBps / 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={handlePrev} className="flex-1 h-12 rounded-xl border border-border/50 font-semibold text-sm hover:bg-accent/50 transition-all">Back</button>
                <button
                  onClick={submit}
                  disabled={isLoading}
                  className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 glow-primary transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Deploying…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                      Deploy Smart Contract
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  ⚠️ {error.message}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
