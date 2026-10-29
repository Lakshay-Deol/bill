"use client";

import React from "react";
import { ArrowRight, Plane } from "lucide-react";
import { BriefState } from "./brief-controls";

interface ShowcaseGridProps {
  onSelectPreset: (preset: BriefState) => void;
  onScrollToTerminal: () => void;
}

export function ShowcaseGrid({ onSelectPreset, onScrollToTerminal }: ShowcaseGridProps) {
  const benchmarkRoutes = [
    {
      num: "01",
      city: "Austin, TX",
      code: "AUS",
      title: "Austin Indie Festival",
      budget: "$250,000",
      uplift: "+45.6%",
      desc: "Indie rock & folk portfolio eliminating redundant cannibalization across seeds.",
      preset: {
        market: "Austin",
        budget: 250000,
        capacity: 5000,
        actCount: 8,
        requireLocal: true,
        seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
      },
    },
    {
      num: "02",
      city: "Tokyo, JP",
      code: "HND",
      title: "Tokyo Shibuya Nights",
      budget: "$320,000",
      uplift: "+48.2%",
      desc: "Trip-hop and neo-city pop cross-genre synergies in high density market.",
      preset: {
        market: "Tokyo",
        budget: 320000,
        capacity: 6500,
        actCount: 8,
        requireLocal: true,
        seeds: ["Massive Attack", "Portishead", "Cornelius"],
      },
    },
    {
      num: "03",
      city: "New York, NY",
      code: "JFK",
      title: "Brooklyn Warehouse",
      budget: "$180,000",
      uplift: "+43.9%",
      desc: "Alternative & art rock lineup balancing emerging acts with high efficiency.",
      preset: {
        market: "New York",
        budget: 180000,
        capacity: 3500,
        actCount: 6,
        requireLocal: false,
        seeds: ["Big Thief", "Adrianne Lenker", "Faye Webster"],
      },
    },
  ];

  return (
    <section className="py-16 space-y-10 border-b border-[#f7f9fa]/10">
      {/* Stamped Section Heading (DESIGN.md exact spec) */}
      <div className="overflow-hidden">
        <h2 className="stamp-heading tracking-[0.2em] text-[#f0f0f0] select-none">
          BENCHMARK ROUTES
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[15px] font-light text-[#828384] max-w-xl">
            Real portfolio solves benchmarked against naive booking. Click any flight route to load its parameters into the live solver.
          </p>
        </div>

        <button
          type="button"
          suppressHydrationWarning
          onClick={onScrollToTerminal}
          className="btn-compact-outlined text-xs self-start sm:self-auto"
        >
          <span>Terminal Solver</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#af50ff]" />
        </button>
      </div>

      {/* Flight Route Connected Cards (DESIGN.md Comparison Card spec) */}
      <div className="relative">
        {/* Horizontal flight route connecting line (hidden on mobile) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-[#f7f9fa]/15 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {benchmarkRoutes.map((route) => (
            <div
              key={route.num}
              onClick={() => {
                onSelectPreset(route.preset);
                onScrollToTerminal();
              }}
              className="card-dope relative overflow-hidden group hover:border-[#af50ff]/60 transition cursor-pointer p-8 space-y-6"
            >
              {/* Route Node Marker */}
              <div className="hidden md:flex absolute top-4 right-4 items-center gap-1.5 text-[10px] font-mono text-[#828384]">
                <span className="w-2 h-2 rounded-full border border-[#f7f9fa] bg-[#090909] group-hover:bg-[#af50ff] group-hover:border-[#af50ff] transition" />
                <span>{route.code}</span>
              </div>

              {/* Faint Oversized Number (DESIGN.md spec) */}
              <div className="absolute top-2 left-6 text-7xl font-mono font-bold text-[#f7f9fa]/[0.03] select-none pointer-events-none">
                {route.num}
              </div>

              {/* Card Content */}
              <div className="space-y-2 relative">
                <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#828384] flex items-center gap-2">
                  <Plane className="w-3 h-3 text-[#af50ff] rotate-45" />
                  <span>ROUTE {route.num} // {route.city}</span>
                </div>
                <h4 className="text-xl font-normal text-[#f7f9fa] tracking-tight group-hover:text-white">
                  {route.title}
                </h4>
                <p className="text-[13px] font-light text-[#828384] leading-relaxed">
                  {route.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#f7f9fa]/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[#828384] text-[10px] block uppercase">BUDGET</span>
                  <span className="text-[#f7f9fa] font-medium">{route.budget}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#828384] text-[10px] block uppercase">DEMAND UPLIFT</span>
                  <span className="text-[#e1bdff] font-bold">{route.uplift}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#828384] group-hover:text-[#f7f9fa] transition">
                <span className="text-[11px] uppercase tracking-wider font-mono">
                  Inspect Route →
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#af50ff] group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
