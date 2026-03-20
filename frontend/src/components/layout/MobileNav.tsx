"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const MOBILE_NAV = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Dash", href: "/dashboard", icon: "▣" },
  { label: "Create", href: "/create", icon: "✦", highlight: true },
  { label: "Jobs", href: "/jobs", icon: "◷" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-deep)] border-t border-[var(--border-subtle)] flex items-center justify-around z-50 md:hidden px-2">
      {MOBILE_NAV.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center justify-center gap-1 w-full h-full relative
              ${isActive ? 'text-[var(--copper)]' : 'text-[var(--text-muted)]'}
              ${item.highlight ? 'text-[var(--acid)] scale-110' : ''}
            `}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest">{item.label}</span>
            
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-active"
                className="absolute top-0 w-8 h-[2px] bg-[var(--copper)] rounded-full shadow-[0_0_10px_var(--copper-glow)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
