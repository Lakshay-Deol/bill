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

  const marqueeItems = [...items, ...items];

  return (
    <div className="py-6 border-y border-[#f7f9fa]/10 bg-[#090909] overflow-hidden">
      <div className="max-w-[1200px] mx-auto mb-3 flex items-center justify-between text-[11px] font-mono text-[#828384] tracking-[0.14em] uppercase">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#af50ff]" />
          FLIGHT TELEMETRY & INTELLIGENCE STACK
        </span>
        <span className="hidden sm:inline">ZERO HALLUCINATION INVARIANT ENFORCED</span>
      </div>

      <div className="overflow-hidden flex">
        <div className="animate-marquee gap-6 items-center py-1">
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#090909] border border-[#f7f9fa]/12 text-[12px] font-mono tracking-wider text-[#f7f9fa] whitespace-nowrap hover:border-[#af50ff]/40 transition cursor-default"
              >
                <Icon className="w-3.5 h-3.5 text-[#af50ff]" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
