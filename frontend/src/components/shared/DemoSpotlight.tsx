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
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    // Occasional poll for dynamic content
    const interval = setInterval(updateRect, 500);

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
          background: "rgba(0,0,0,0.6)",
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
          className="absolute border-2 border-[var(--primary)] shadow-[0_0_30px_rgba(59,130,246,0.5)] rounded-lg pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
