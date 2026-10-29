"use client";

import React from "react";
import { Database, Cpu, ShieldCheck, Zap, Layers, Terminal, Sparkles, Server } from "lucide-react";

export function MarqueeTicker() {
  const items = [
    { label: "QLOO TASTE GRAPH API V2", icon: Database },
    { label: "COSINE TASTEOVERLAP METRIC", icon: Layers },
    { label: "SUBMODULAR KNAPSACK SOLVER", icon: Cpu },
    { label: "UPSTASH REDIS CACHE LAYER", icon: Zap },
    { label: "NEXT.JS 15 APP ROUTER", icon: Server },
    { label: "ZOD BOUNDARY VALIDATION", icon: ShieldCheck },
    { label: "PURE DETERMINISTIC SOLVER", icon: Terminal },
    { label: "EST. HEURISTIC FEE MODEL", icon: Sparkles },
  ];

  // Quadruple items to make the track seamlessly seamless
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full py-3 border-y border-white/10 bg-[#070709]/60 backdrop-blur-md overflow-hidden">
      <div className="overflow-hidden w-full flex">
        <div className="animate-marquee flex flex-row flex-nowrap items-center gap-4 py-1">
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131316]/90 border border-white/10 text-xs font-mono tracking-wider text-[#f1eff0] whitespace-nowrap hover:border-[#cbf230]/40 transition-colors cursor-default shrink-0 shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#cbf230] shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
