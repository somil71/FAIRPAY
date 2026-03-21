"use client";
import React from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import DemoPanel from "../demo/DemoPanel";
import DemoSpotlight from "../demo/DemoSpotlight";
import { useAppStore } from "@/store/appStore";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MainLayout — Platform Shell
 * Wraps all pages with the persistent Sidebar (desktop) and MobileNav (tablet/mobile).
 * Ensures correct spacing for the offset content area.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast, isDemoMode } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex">
      {/* Visual Overlays */}
      <DemoSpotlight isActive={isDemoMode} />
      <DemoPanel />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] pb-24 md:pb-8 relative flex flex-col">

        {/* Subtle background grain or grid could go here */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="container mx-auto px-6 py-8 md:px-12 md:py-12 relative z-10 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Toast System */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              onClick={() => removeToast(t.id)}
              className={`
                min-w-[300px] p-4 rounded-sm border-l-4 shadow-2xl cursor-pointer
                ${t.type === 'success' ? 'bg-[var(--bg-elevated)] border-[var(--accent)]' : 
                  t.type === 'warning' ? 'bg-[var(--bg-elevated)] border-[var(--warning)]' :
                  t.type === 'pending' ? 'bg-[var(--bg-elevated)] border-[var(--primary)]' :
                  'bg-[var(--bg-elevated)] border-[var(--danger)]'}
              `}
            >
              <h4 className="text-xs font-mono font-black uppercase tracking-widest mb-1">
                {t.title}
              </h4>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                {t.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
