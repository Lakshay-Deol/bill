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
  hasReceipt?: boolean;
}

export function Header({
  onOpenMatrix,
  onOpenTimetable,
  onOpenPoster,
  onScrollToTerminal,
  onScrollToQloo,
  onScrollToFeatures,
  hasReceipt = false,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 frosted-nav-bar px-4 sm:px-8 h-12 flex items-center transition-all duration-300">
      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between gap-6">
        {/* Brand Wordmark (Left) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-left group"
          >
            <span className="text-[14px] sm:text-[15px] font-medium tracking-tight text-[#f7f9fa] group-hover:text-white transition">
              THE BILL
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-[0.14em] text-[#828384] border-l border-[#6b6b6b]/60 pl-2">
              QLOO TERMINAL
            </span>
          </button>
        </div>

        {/* Center Nav Items (Whyte Inktrap 12px uppercase, 0.07em tracking) */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] sm:text-[12px] uppercase tracking-[0.07em]">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-[#828384] hover:text-[#f7f9fa] py-1 transition hover:underline underline-offset-4"
          >
            Overview
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToFeatures}
            className="text-[#828384] hover:text-[#f7f9fa] py-1 transition hover:underline underline-offset-4"
          >
            Disciplines
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToQloo}
            className="text-[#828384] hover:text-[#f7f9fa] py-1 transition hover:underline underline-offset-4"
          >
            Taste Graph
          </button>

          {hasReceipt && (
            <div className="flex items-center gap-4 pl-3 border-l border-[#6b6b6b]/50">
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenMatrix}
                className="text-[#828384] hover:text-[#af50ff] py-1 transition flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#af50ff]" />
                Matrix
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenTimetable}
                className="text-[#828384] hover:text-[#f7f9fa] py-1 transition flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#828384]" />
                Timetable
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenPoster}
                className="text-[#828384] hover:text-[#f7f9fa] py-1 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#828384]" />
                Poster
              </button>
            </div>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#f7f9fa]/[0.06] border border-[#f7f9fa]/20 text-[10px] font-mono text-[#828384]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#af50ff] animate-pulse" />
            <span>575M+ VECTORS</span>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToTerminal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-mono tracking-tight text-[#f7f9fa] bg-[#090909] border border-[#f7f9fa] hover:bg-[#171717] hover:border-white transition"
          >
            <Terminal className="w-3.5 h-3.5 text-[#af50ff]" />
            <span>OPEN SOLVER</span>
          </button>
        </div>
      </div>
    </header>
  );
}
