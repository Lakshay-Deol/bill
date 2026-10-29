"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Always show when near the very top of the document
      if (currentScrollY <= 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down -> hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up -> reveal navbar
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-3 sm:top-4 left-0 right-0 z-50 px-4 sm:px-8 pointer-events-none transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Top Left: Project Brandmark */}
        <div className="pointer-events-auto flex items-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#070709]/85 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/5 hover:border-[#cbf230]/50 transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-[#cbf230] group-hover:shadow-[0_0_8px_#cbf230] transition-all animate-pulse" />
            <span className="font-syne text-xs uppercase tracking-wider font-extrabold text-[#f1eff0]">
              CROWDFOLIO
            </span>
            <span className="text-[10px] font-mono text-[#a69fa9] border-l border-white/10 pl-2 hidden sm:inline">
              QLOO ENGINE
            </span>
          </button>
        </div>

        {/* Center: Navigation Pill Capsule */}
        <div className="pointer-events-auto flex items-center justify-center bg-[#070709]/85 backdrop-blur-2xl px-3 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
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
              Crowdfolio
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

        {/* Right side balance spacer */}
        <div className="hidden lg:block w-36 pointer-events-none" />
      </div>
    </header>
  );
}
