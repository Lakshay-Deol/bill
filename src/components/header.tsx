"use client";

import React from "react";
import { Terminal, Layers, Calendar, Printer } from "lucide-react";

interface HeaderProps {
  onOpenMatrix?: () => void;
  onOpenTimetable?: () => void;
  onOpenPoster?: () => void;
  onScrollToTerminal?: () => void;
  onScrollToQloo?: () => void;
  onScrollToFeatures?: () => void;
  onScrollToBill?: () => void;
  hasReceipt?: boolean;
}

export function Header({
  onOpenMatrix,
  onOpenTimetable,
  onOpenPoster,
  onScrollToTerminal,
  onScrollToQloo,
  onScrollToFeatures,
  onScrollToBill,
  hasReceipt = false,
}: HeaderProps) {
  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center items-center px-4 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto max-w-[1440px] w-full flex items-center justify-between gap-3 sm:gap-6 bg-[#070709]/85 backdrop-blur-2xl px-4 sm:px-6 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
        {/* Brand Wordmark (Left) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-baseline gap-2 text-left group cursor-pointer"
          >
            <span className="font-syne text-[16px] sm:text-[18px] font-bold tracking-tight text-[#f1eff0] uppercase group-hover:text-[#dfb7ff] transition-colors">
              THE BILL
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.14em] text-[#a69fa9] border-l border-white/10 pl-2">
              QLOO TERMINAL
            </span>
          </button>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131316]/70 px-2 py-1 rounded-full border border-white/5 text-[11px] font-mono uppercase tracking-wider">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-3 py-1 rounded-full text-[#f1eff0] hover:text-[#cbf230] hover:bg-white/5 transition-all cursor-pointer"
          >
            Overview
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToFeatures}
            className="px-3 py-1 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all cursor-pointer"
          >
            Disciplines
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToQloo}
            className="px-3 py-1 rounded-full text-[#a69fa9] hover:text-[#dfb7ff] hover:bg-white/5 transition-all cursor-pointer"
          >
            Taste Graph
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToBill}
            className="px-3 py-1 rounded-full text-[#a69fa9] hover:text-[#cbf230] hover:bg-white/5 transition-all cursor-pointer"
          >
            The Bill
          </button>

          {hasReceipt && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenMatrix}
                className="px-2.5 py-1 rounded-full text-[#a69fa9] hover:text-[#af50ff] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3 text-[#af50ff]" />
                Matrix
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenTimetable}
                className="px-2.5 py-1 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-[#a69fa9]" />
                Timetable
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenPoster}
                className="px-2.5 py-1 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3 text-[#a69fa9]" />
                Poster
              </button>
            </div>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131316]/80 border border-white/10 text-[10px] font-mono text-[#a69fa9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cbf230] animate-pulse" />
            <span>575M+ VECTORS</span>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToTerminal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wide text-[#09090b] bg-[#cbf230] hover:bg-[#d8ff3e] shadow-[0_0_16px_rgba(203,242,48,0.3)] transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#09090b]" />
            <span>SOLVER TERMINAL</span>
          </button>
        </div>
      </div>
    </header>
  );
}
