"use client";

import React from "react";
import { Plus, Heart } from "lucide-react";

interface CoordinateFooterProps {
  market: string;
}

export function CoordinateFooter({ market }: CoordinateFooterProps) {
  const getCoordinates = (m: string) => {
    const lower = m.toLowerCase();
    if (lower.includes("tokyo")) return "35.6764° N, 139.6500° E · 44m ELEV";
    if (lower.includes("new york") || lower.includes("brooklyn")) return "40.7128° N, 74.0060° W · 10m ELEV";
    if (lower.includes("chicago")) return "41.8781° N, 87.6298° W · 182m ELEV";
    return "30.2672° N, 97.7431° W · 146m ELEV"; // Austin default
  };

  return (
    <footer className="w-full bg-[#090909] border-t border-[#f7f9fa]/10 py-8 px-4 sm:px-8 mt-16 select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-[#828384]">
        {/* Left: '+' icon, Fly Direct and Festival Portfolio Solver */}
        <div className="flex items-center gap-3">
          <Plus className="w-4 h-4 text-[#af50ff]" />
          <span className="text-[#f7f9fa] font-medium tracking-tight">Crowdfolio</span>
          <span className="text-[#474747]">&bull;</span>
          <span className="text-[#828384]">Festival Portfolio Optimizer</span>
          <span className="text-[#474747]">&bull;</span>
          <span className="text-[#828384] hidden md:inline">Fly Direct</span>
        </div>

        {/* Right: GPS Coordinate + Heart Icon */}
        <div className="flex items-center gap-2.5 font-mono text-xs sm:text-[13px] text-[#828384]">
          <span className="text-[#f7f9fa] tracking-wider">{getCoordinates(market)}</span>
          <span className="text-[#474747]">/</span>
          <span className="uppercase text-[#828384]">{market}</span>
          <Heart className="w-3.5 h-3.5 text-[#f7f9fa] fill-[#f7f9fa] ml-1" />
        </div>
      </div>
    </footer>
  );
}
