"use client";

import React from "react";
import { LineupReceipt } from "@/lib/solver";
import { TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";

interface NaiveComparisonBannerProps {
  receipt: LineupReceipt;
}

export function NaiveComparisonBanner({ receipt }: NaiveComparisonBannerProps) {
  const naive = receipt.naiveComparison;
  if (!naive) return null;

  const uplift = receipt.upliftPercent ?? (
    ((receipt.modeledUniqueDemand - naive.modeledUniqueDemand) / Math.max(1, naive.modeledUniqueDemand)) * 100
  );

  return (
    <div className="p-5 rounded-2xl bg-[#1e1414]/90 border border-[#fc5a36]/40 backdrop-blur-md shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#fc5a36]/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#fc5a36]" />
          <h3 className="font-syne text-sm font-bold uppercase text-[#f1eff0] tracking-wide">
            Greedy Booking vs Submodular Portfolio Solver
          </h3>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#fc5a36]/20 text-[#ffb4a3] border border-[#fc5a36]/40 font-bold self-start sm:self-auto">
          +{uplift.toFixed(1)}% UNIQUE REACH UPLIFT
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        {/* Metric 1: Unique Reach */}
        <div className="p-3 rounded-xl bg-[#070709]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#a69fa9] block">MODELED UNIQUE REACH</span>
          <div className="flex items-baseline justify-between">
            <span className="text-[#cbf230] font-bold">
              {Math.round(receipt.modeledUniqueDemand).toLocaleString("en-US")}
            </span>
            <span className="text-[#a69fa9] line-through text-[11px]">
              {Math.round(naive.modeledUniqueDemand).toLocaleString("en-US")} (naive)
            </span>
          </div>
          <span className="text-[10px] text-[#cbf230] block">
            +{Math.round(receipt.modeledUniqueDemand - naive.modeledUniqueDemand).toLocaleString("en-US")} incremental fans
          </span>
        </div>

        {/* Metric 2: Taste Overlap */}
        <div className="p-3 rounded-xl bg-[#070709]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#a69fa9] block">AVG TASTEOVERLAP</span>
          <div className="flex items-baseline justify-between">
            <span className="text-[#dfb7ff] font-bold">
              {receipt.avgTasteOverlap.toFixed(2)}
            </span>
            <span className="text-[#fc5a36] text-[11px]">
              {naive.avgTasteOverlap.toFixed(2)} (cannibalized)
            </span>
          </div>
          <span className="text-[10px] text-[#a69fa9] block">
            Greedy line-up repurchases identical listener pools
          </span>
        </div>

        {/* Metric 3: Total Spend */}
        <div className="p-3 rounded-xl bg-[#070709]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#a69fa9] block">TOTAL TALENT SPEND</span>
          <div className="flex items-baseline justify-between">
            <span className="text-[#f1eff0] font-bold">
              est. ${(receipt.totalSpent / 1000).toFixed(1)}k
            </span>
            <span className="text-[#a69fa9] text-[11px]">
              est. ${(naive.totalSpent / 1000).toFixed(1)}k
            </span>
          </div>
          <span className="text-[10px] text-[#cbf230] block">
            est. ${Math.max(0, (naive.totalSpent - receipt.totalSpent) / 1000).toFixed(1)}k budget conserved
          </span>
        </div>
      </div>
    </div>
  );
}

