"use client";
import { motion } from "framer-motion";

export default function NFTReveal({ index, delay = 0 }: { index: number, delay?: number }) {
  return (
    <motion.div 
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="aspect-[3/4] border border-primary/30 bg-gradient-to-b from-card to-background rounded-2xl p-6 shadow-md hover:shadow-xl flex flex-col justify-between group hover:border-primary/60 transition-all cursor-crosshair relative overflow-hidden"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </div>
        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground bg-accent px-2 py-1 rounded">Tier {index}</span>
      </div>
      
      <div className="relative z-10">
        <h4 className="font-bold text-xl tracking-tight leading-tight mb-2">Web3 Dev Sprint</h4>
        <p className="text-sm font-mono text-muted-foreground font-medium">For: 0xClient...{index}4</p>
      </div>
      
      <div className="pt-5 border-t border-border/70 flex gap-2 relative z-10">
        <span className="bg-success/15 text-success text-[10px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded">On Time</span>
        <span className="bg-primary/15 text-primary text-[10px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded">Verified</span>
      </div>
    </motion.div>
  );
}
