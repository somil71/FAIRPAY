"use client";
import React from "react";

/**
 * Component: LoadingSkeleton
 * Purpose: Provides a premium, on-theme loading state for cards and rows.
 */
export default function LoadingSkeleton({ type = "card" }: { type?: "card" | "row" | "text" }) {
  if (type === "row") {
    return (
      <div className="flex gap-4 items-center w-full p-4 border-b border-[var(--border-subtle)]">
        <div className="w-10 h-10 rounded-sm skeleton" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-1/3 skeleton" />
          <div className="h-3 w-1/4 skeleton opacity-50" />
        </div>
        <div className="w-24 h-8 rounded-sm skeleton" />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-5/6 skeleton" />
        <div className="h-4 w-2/3 skeleton" />
      </div>
    );
  }

  return (
    <div className="card p-8 flex flex-col gap-6 opacity-60">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 w-1/2">
          <div className="h-3 w-1/4 skeleton mb-2" />
          <div className="h-8 w-full skeleton" />
        </div>
        <div className="w-20 h-6 rounded-full skeleton" />
      </div>
      <div className="h-20 w-full skeleton" />
      <div className="flex justify-between items-center mt-4">
        <div className="w-32 h-10 rounded-sm skeleton" />
        <div className="w-24 h-4 skeleton" />
      </div>
    </div>
  );
}
