"use client";
import { motion } from "framer-motion";

export default function ReleaseAnimation() {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: [0, 4, 8], opacity: [0.6, 0.4, 0] }}
      transition={{ duration: 1.2, times: [0, 0.5, 1], ease: "easeOut" }}
      className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-success/20 rounded-full pointer-events-none z-0"
    />
  );
}
