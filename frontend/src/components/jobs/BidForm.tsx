"use client";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function BidForm({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return <button className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-md text-sm font-bold opacity-60 cursor-not-allowed">Connect to Bid</button>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerAddress: address,
          proposedAmount: Number(amount),
          coverNote: note,
        }),
      });

      if (response.ok) {
        alert("Bid submitted successfully!");
        setOpen(false);
        setAmount("");
        setNote("");
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      alert("Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} className="px-5 py-2.5 hover:bg-primary/90 bg-primary text-primary-foreground rounded-md text-sm font-bold shadow-sm transition-colors tracking-wide">Submit Bid</button>;
  }

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border shadow-xl p-8 rounded-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-3 tracking-tight">Bid on {jobTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 font-medium">Bids require a small anti-spam bond (mocked). Your proposal will be sent to the client.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Proposal Note</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border rounded-md min-h-[120px] bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="Briefly explain why you are the best fit for this role."
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Proposed Total (USD)</label>
            <input 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="e.g. 5000" 
              type="number" 
              required
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-3 border rounded-md font-bold text-sm hover:bg-accent transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] px-4 py-3 hover:bg-primary/90 bg-primary text-primary-foreground rounded-md font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
