"use client";
import React from "react";

interface SelectProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  // Simple implementation using standard select for now to avoid radix complexity
  // We'll map children to options if they are SelectItem
  const options: { value: string; label: string }[] = [];
  
  React.Children.forEach(children, (child: any) => {
    if (child?.type?.displayName === 'SelectContent') {
      React.Children.forEach(child.props.children, (item: any) => {
        if (item?.type?.displayName === 'SelectItem') {
          options.push({ value: item.props.value, label: item.props.children });
        }
      });
    }
  });

  return (
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-4 py-2 text-xs font-mono text-[var(--text-primary)] appearance-none cursor-pointer focus:border-[var(--warning)] outline-none transition-all"
      >
        <option value="" disabled>Choose an option</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--warning)] transition-colors">
        ▼
      </div>
    </div>
  );
};

export const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ children }: any) => <>{children}</>;

SelectTrigger.displayName = 'SelectTrigger';
SelectValue.displayName = 'SelectValue';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
