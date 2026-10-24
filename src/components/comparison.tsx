"use client";

import React from "react";
import { LineupReceipt } from "@/lib/solver";
import { TrendingUp, Users, DollarSign, ShieldAlert } from "lucide-react";

interface ComparisonProps {
  receipt: LineupReceipt;
}

export function Comparison({ receipt }: ComparisonProps) {
  const naive = receipt.naiveComparison;
  if (!naive) return null;

  const demandLift = receipt.modeledUniqueDemand - naive.modeledUniqueDemand;
  const overlapDiff = (naive.avgTasteOverlap - receipt.avgTasteOverlap) * 100;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-5 shadow-2xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>The Value Comparison</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Same talent budget spent the naive way vs. portfolio-optimized
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              Demand Uplift
            </div>
            <div className="text-base font-black text-emerald-300">
              +{demandLift.toLocaleString("en-US")} fans ({receipt.upliftPercent ?? 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Modeled Unique Demand
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-zinc-100">
              {receipt.modeledUniqueDemand.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-zinc-500 line-through">
              {naive.modeledUniqueDemand.toLocaleString("en-US")}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-medium">
            +{receipt.upliftPercent}% more distinct attendance
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Avg Taste Overlap
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-zinc-100">
              {(receipt.avgTasteOverlap * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-500 line-through">
              {(naive.avgTasteOverlap * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-medium">
            -{overlapDiff.toFixed(1)} percentage points cannibalization
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Talent Spend
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-zinc-100">
              ${receipt.totalSpent.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-zinc-500">
              ${naive.totalSpent.toLocaleString("en-US")} naive
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Remaining: ${receipt.remainingBudget.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      {/* Roster comparison table */}
      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
        <div className="grid grid-cols-2 text-xs font-semibold text-zinc-300 bg-zinc-900/60 p-2.5 border-b border-zinc-800">
          <span>The Bill Lineup ({receipt.lineup.length} Acts)</span>
          <span>Naive Lineup ({naive.acts.length} Acts)</span>
        </div>
        <div className="divide-y divide-zinc-800/60 text-xs">
          {Array.from({ length: Math.max(receipt.lineup.length, naive.acts.length) }).map((_, i) => {
            const optAct = receipt.lineup[i];
            const naiveAct = naive.acts[i];

            return (
              <div key={i} className="grid grid-cols-2 p-2.5 hover:bg-zinc-900/30 transition">
                <div className="pr-2">
                  {optAct ? (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200">{optAct.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        est. ${optAct.fee.toLocaleString("en-US")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </div>
                <div className="pl-2 border-l border-zinc-800/60">
                  {naiveAct ? (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">{naiveAct.name}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        est. ${naiveAct.fee.toLocaleString("en-US")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
