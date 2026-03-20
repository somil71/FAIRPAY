"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoSpotlightProps {
  selector?: string;
  isActive: boolean;
}

export default function DemoSpotlight({ selector, isActive }: DemoSpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !selector) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    // Frequent poll for dynamic content/animations
    const interval = setInterval(updateRect, 300);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      clearInterval(interval);
    };
  }, [selector, isActive]);

  if (!isActive || !rect) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: "rgba(0,0,0,0.7)",
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${rect.left}px 100%, 
            ${rect.left}px ${rect.top}px, 
            ${rect.right}px ${rect.top}px, 
            ${rect.right}px ${rect.bottom}px, 
            ${rect.left}px ${rect.bottom}px, 
            ${rect.left}px 100%, 
            100% 100%, 
            100% 0%
          )`,
        }}
      >
        <div 
          className="absolute border-2 border-[var(--primary)] shadow-[0_0_50px_rgba(59,130,246,0.6)] rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - 12,
            left: rect.left - 12,
            width: rect.width + 24,
            height: rect.height + 24,
          }}
        />
        <div 
          className="absolute border border-[var(--primary-light)]/30 rounded-3xl pointer-events-none transition-all duration-500 scale-110 opacity-50"
          style={{
            top: rect.top - 20,
            left: rect.left - 20,
            width: rect.width + 40,
            height: rect.height + 40,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
