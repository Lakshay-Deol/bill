"use client";

import React from "react";
import { Layers, Calendar, Printer } from "lucide-react";

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
      <div className="pointer-events-auto flex items-center justify-center bg-[#070709]/85 backdrop-blur-2xl px-3 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
        {/* Only the center navigation part */}
        <nav className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-3.5 py-1.5 rounded-full text-[#f1eff0] hover:text-[#cbf230] hover:bg-white/5 transition-all cursor-pointer font-medium"
          >
            Overview
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToFeatures}
            className="px-3.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all cursor-pointer"
          >
            Disciplines
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToQloo}
            className="px-3.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#dfb7ff] hover:bg-white/5 transition-all cursor-pointer"
          >
            Taste Graph
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onScrollToBill}
            className="px-3.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#cbf230] hover:bg-white/5 transition-all cursor-pointer"
          >
            The Bill
          </button>

          {hasReceipt && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenMatrix}
                className="px-2.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#dfb7ff] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3 text-[#dfb7ff]" />
                Matrix
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenTimetable}
                className="px-2.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-[#a69fa9]" />
                Timetable
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={onOpenPoster}
                className="px-2.5 py-1.5 rounded-full text-[#a69fa9] hover:text-[#f1eff0] hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3 text-[#a69fa9]" />
                Poster
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
