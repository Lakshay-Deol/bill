"use client";

import React from "react";
import { ArrowRight, Plane, Sparkles, Database } from "lucide-react";
import { CosmicCanvas } from "./cosmic-canvas";

interface LandingHeroProps {
  onLaunchTerminal: () => void;
  onExploreQloo: () => void;
}

export function LandingHero({ onLaunchTerminal, onExploreQloo }: LandingHeroProps) {
  return (
    <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 overflow-hidden">
      {/* Twilight Sky Horizon with subtle airplane streak */}
      <CosmicCanvas />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Luxury Travel Editorial Typography (GrandSlang + Whyte Inktrap) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="font-grandslang-italic text-5xl sm:text-7xl lg:text-[88px] text-[#f7f9fa] block leading-[0.85]">
              Your new
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-normal tracking-[-0.03em] text-[#f7f9fa] leading-[1.05]">
              Festival Lineup Solver
            </h1>
            <span className="font-grandslang-italic text-3xl sm:text-5xl lg:text-[52px] text-[#e1bdff] block leading-[0.95] pt-1">
              grounded in Qloo taste graph
            </span>
          </div>

          <p className="text-lg sm:text-[20px] font-light text-[#f7f9fa]/80 leading-relaxed max-w-xl">
            Traditional festival booking wastes up to 45% of talent budgets on duplicative acts sharing identical fans. 
            The Bill models lineups as submodular portfolios, maximizing distinct ticket-buying households at constant spend.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              suppressHydrationWarning
              onClick={onLaunchTerminal}
              className="btn-filled-action text-[15px] px-6 py-3"
            >
              <span>Explore Live Terminal</span>
              <ArrowRight className="w-4 h-4 text-[#af50ff]" />
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={onExploreQloo}
              className="btn-compact-outlined text-[13px] px-4 py-2.5 text-[#828384] hover:text-[#f7f9fa]"
            >
              <Database className="w-3.5 h-3.5 text-[#af50ff]" />
              <span>Why Qloo Taste Graph</span>
            </button>
          </div>

          {/* Stamped Departure Strip */}
          <div className="pt-6 border-t border-[#f7f9fa]/10 flex flex-wrap items-center gap-6 text-[13px] text-[#828384] font-mono">
            <span className="flex items-center gap-1.5 text-[#f7f9fa]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#af50ff]" />
              FLY DIRECT:
            </span>
            <span>AUSTIN · AUS</span>
            <span className="text-[#474747]">/</span>
            <span>TOKYO · HND</span>
            <span className="text-[#474747]">/</span>
            <span>BROOKLYN · JFK</span>
            <span className="text-[#474747]">/</span>
            <span>CHICAGO · ORD</span>
          </div>
        </div>

        {/* Right Column: Hero Boarding Pass Card (DESIGN.md exact spec) */}
        <div className="lg:col-span-5">
          <div className="card-boarding-pass space-y-6">
            {/* Header: Boarding Pass Label + Flight Icon */}
            <div className="flex items-center justify-between border-b border-[#f7f9fa]/15 pb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#af50ff] rotate-45" />
                <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#f0f0f0]">
                  BOARDING PASS
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#828384] uppercase tracking-widest">
                CLASS: FIRST
              </span>
            </div>

            {/* Route Stamp: ORIGIN LEGACY -> DESTINATION THE BILL */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#828384]">
                ROUTING PROTOCOL
              </div>
              <div className="text-[14px] font-mono text-[#f7f9fa] flex items-center justify-between py-1 border-y border-[#f7f9fa]/10">
                <span className="tracking-wide">LEGACY GUESSWORK</span>
                <span className="text-[#af50ff] font-bold">→</span>
                <span className="tracking-wide text-[#e1bdff]">THE BILL QLOO</span>
              </div>
            </div>

            {/* 32px Whyte Inktrap Heading */}
            <div className="space-y-2">
              <h3 className="text-[26px] sm:text-[32px] font-normal text-[#f7f9fa] leading-[1.15] tracking-tight">
                Solves optimal lineup in seconds
              </h3>
              <p className="text-[14px] text-[#828384] leading-relaxed">
                Deterministic submodular knapsack solver. Zero hallucinated fees or audience claims.
              </p>
            </div>

            {/* Two Ghost Pill Buttons (DESIGN.md spec: 1584px radius, 20px 32px padding, faint pink wash) */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                suppressHydrationWarning
                onClick={onLaunchTerminal}
                className="btn-ghost-pill w-full justify-between group hover:border hover:border-[#af50ff]/40"
              >
                <span className="text-left text-sm font-medium">Solve Austin $250k Lineup</span>
                <span className="text-[#af50ff] text-xs font-mono group-hover:translate-x-1 transition">
                  PROCEED →
                </span>
              </button>

              <button
                type="button"
                suppressHydrationWarning
                onClick={onExploreQloo}
                className="btn-ghost-pill w-full justify-between group"
              >
                <span className="text-left text-sm font-normal text-[#828384] group-hover:text-white transition">
                  575M+ Cultural Embeddings
                </span>
                <span className="text-[#828384] text-xs font-mono">SPEC →</span>
              </button>
            </div>

            {/* Authentic Flight Barcode Graphic */}
            <div className="pt-2 flex items-center justify-between border-t border-[#f7f9fa]/10 text-[#828384]">
              <div className="flex items-center gap-[3px] h-8 opacity-75">
                {[4, 2, 6, 1, 3, 5, 2, 1, 4, 2, 7, 1, 3, 2, 5, 1, 6, 2, 4, 3, 1, 5, 2, 6, 3, 1, 4].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-[#f7f9fa] h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono tracking-widest text-[#828384]">
                QLOO-OPT-2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
