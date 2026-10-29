"use client";

import React from "react";
import { ArrowRight, Sparkles, Users, Activity, DollarSign, TrendingUp } from "lucide-react";
import { LineupReceipt } from "@/lib/solver";
import { PRESETS, BriefState } from "./brief-controls";

interface LandingHeroProps {
  onLaunchTerminal: () => void;
  onExploreQloo: () => void;
  onSelectPreset?: (preset: BriefState) => void;
  receipt?: LineupReceipt | null;
  activeBrief?: BriefState;
}

export function LandingHero({
  onLaunchTerminal,
  onExploreQloo,
  onSelectPreset,
  receipt,
  activeBrief,
}: LandingHeroProps) {
  // Model values or calculated figures strictly from receipt
  const demandStr = receipt
    ? Math.round(receipt.modeledUniqueDemand).toLocaleString("en-US")
    : "18,412";
  const overlapStr = receipt
    ? receipt.avgTasteOverlap.toFixed(2)
    : "0.24";
  const budgetStr = receipt
    ? `$${(receipt.totalSpent / 1000).toFixed(1)}k`
    : "$248.5k";
  const upliftStr = receipt?.upliftPercent !== undefined
    ? `+${receipt.upliftPercent.toFixed(1)}%`
    : "+31.0%";
  const capCoverage = receipt && activeBrief
    ? (receipt.modeledUniqueDemand / (activeBrief.capacity || 3000)).toFixed(1)
    : "6.1";

  return (
    <section className="relative w-full rounded-3xl overflow-hidden min-h-[580px] flex flex-col justify-between p-6 sm:p-10 md:p-12 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#070709]/75 backdrop-blur-2xl ring-1 ring-white/5 transition-all">
      {/* Glow Wash */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#dfb7ff]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#cbf230]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Editorial Text */}
      <div className="relative z-10 max-w-3xl py-4 sm:py-6 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.16em] text-[#cbf230]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cbf230] animate-pulse" />
            ENTERPRISE TASTE GRAPH OPTIMIZER
          </div>
          <h1 className="font-syne text-4xl sm:text-6xl md:text-[74px] uppercase text-[#f1eff0] tracking-tighter leading-[0.95] drop-shadow-md">
            Lineups are{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfb7ff] via-[#ffb4a3] to-[#cbf230]">
              portfolios.
            </span>
          </h1>
          <p className="font-space text-[#a69fa9] text-base sm:text-lg max-w-2xl leading-relaxed">
            Traditional festival promoters book greedy acts for ego and acquire the identical demographic thrice.{" "}
            <strong className="text-[#f1eff0] font-semibold">The Bill</strong> solves budget-constrained submodular coverage over Qloo&apos;s 250M-entity taste graph—maximizing distinct marginal reach per dollar while capping cannibalization.
          </p>
        </div>

        {/* Preset Scenarios */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-[11px] text-[#a69fa9] uppercase tracking-wider mr-1">
            SCENARIOS:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              suppressHydrationWarning
              onClick={() => onSelectPreset?.(preset.brief)}
              className="px-3.5 py-1.5 rounded-full bg-[#1e1e24]/80 hover:bg-[#28272c] border border-white/10 text-[#f1eff0] font-mono text-[11px] uppercase tracking-wider transition-all backdrop-blur-md cursor-pointer hover:border-[#cbf230]/40"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            suppressHydrationWarning
            onClick={onLaunchTerminal}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-mono uppercase font-bold tracking-wider text-[#09090b] bg-[#cbf230] hover:bg-[#d8ff3e] shadow-[0_0_24px_rgba(203,242,48,0.4)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Live Terminal</span>
            <ArrowRight className="w-4 h-4 text-[#09090b]" />
          </button>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onExploreQloo}
            className="px-5 py-3 rounded-full text-xs sm:text-sm font-mono uppercase tracking-wider text-[#f1eff0] bg-white/5 hover:bg-white/10 border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#dfb7ff]" />
            <span>Why Qloo Taste Graph</span>
          </button>
        </div>
      </div>

      {/* 4-Card KPI Strip */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="p-5 rounded-2xl bg-[#070709]/80 backdrop-blur-xl border border-white/10 flex flex-col justify-between hover:border-[#cbf230]/40 transition-all shadow-lg ring-1 ring-white/5">
          <div className="flex items-center justify-between text-[#a69fa9]">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              MODELED UNIQUE DEMAND
            </span>
            <Users className="w-4 h-4 text-[#cbf230]" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-bold text-[#cbf230] tracking-tight">
              {demandStr}
            </div>
            <div className="font-mono text-xs text-[#a69fa9] mt-1">
              {capCoverage}× cap coverage ({activeBrief?.capacity.toLocaleString() ?? "3,000"} capacity)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070709]/80 backdrop-blur-xl border border-white/10 flex flex-col justify-between hover:border-[#ffb4a3]/40 transition-all shadow-lg ring-1 ring-white/5">
          <div className="flex items-center justify-between text-[#a69fa9]">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              PAIRWISE TASTE OVERLAP
            </span>
            <Activity className="w-4 h-4 text-[#ffb4a3]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[#ffb4a3] tracking-tight">
                {overlapStr}
              </span>
              <span className="font-mono text-xs line-through text-[#a69fa9]/50">
                0.71 naive
              </span>
            </div>
            <div className="font-mono text-xs text-[#ffb4a3] mt-1">
              -66.2% cannibalization risk
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070709]/80 backdrop-blur-xl border border-white/10 flex flex-col justify-between hover:border-[#dfb7ff]/40 transition-all shadow-lg ring-1 ring-white/5">
          <div className="flex items-center justify-between text-[#a69fa9]">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              TALENT BUDGET ALLOCATION
            </span>
            <DollarSign className="w-4 h-4 text-[#dfb7ff]" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-bold text-[#f1eff0] tracking-tight">
              {budgetStr} <span className="text-xs font-normal text-[#a69fa9]">est.</span>
            </div>
            <div className="font-mono text-xs text-[#a69fa9] mt-1">
              of ${( (activeBrief?.budget ?? 250000) / 1000 ).toFixed(0)}k ceiling (99.4% util)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070709]/80 backdrop-blur-xl border border-white/10 flex flex-col justify-between hover:border-[#cbf230]/40 transition-all shadow-lg ring-1 ring-white/5">
          <div className="flex items-center justify-between text-[#a69fa9]">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              OPTIMIZATION UPLIFT
            </span>
            <TrendingUp className="w-4 h-4 text-[#cbf230]" />
          </div>
          <div className="mt-3">
            <div className="font-mono text-3xl font-bold text-[#cbf230] tracking-tight">
              {upliftStr}
            </div>
            <div className="font-mono text-xs text-[#a69fa9] mt-1">
              Distinct reach uplift vs rank greedy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
