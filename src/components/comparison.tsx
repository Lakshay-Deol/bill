"use client";

import React from "react";
import { LineupReceipt } from "@/lib/solver";
import { Users, DollarSign, ShieldAlert } from "lucide-react";

interface ComparisonProps {
  receipt: LineupReceipt;
}

export function Comparison({ receipt }: ComparisonProps) {
  const naive = receipt.naiveComparison;
  if (!naive) return null;

  const demandLift = receipt.modeledUniqueDemand - naive.modeledUniqueDemand;
  const overlapDiff = (naive.avgTasteOverlap - receipt.avgTasteOverlap) * 100;

  return (
    <div className="card-dope p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#f7f9fa]/10 gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#af50ff]">
            BENCHMARK EVALUATION
          </div>
          <h3 className="text-xl sm:text-2xl font-normal text-[#f7f9fa] tracking-tight">
            The Bill vs. Naive Booking
          </h3>
          <p className="text-[14px] font-light text-[#828384]">
            Same talent budget spent on naive chart-toppers vs. Qloo submodular portfolio optimization.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#af50ff]/40 bg-[#af50ff]/10 px-5 py-2.5 text-center self-start sm:self-auto">
          <div className="text-[10px] font-mono text-[#af50ff] uppercase tracking-wider">
            DEMAND UPLIFT
          </div>
          <div className="text-xl font-bold text-[#f7f9fa] font-mono">
            +{demandLift.toLocaleString("en-US")} fans ({receipt.upliftPercent ?? 0}%)
          </div>
        </div>
      </div>

      {/* KPI 3-Column Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-[8px] p-5 bg-[#f7f9fa]/[0.03] border border-[#f7f9fa]/10 space-y-2">
          <div className="text-xs font-mono text-[#828384] flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#af50ff]" /> Modeled Unique Demand
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono text-[#f7f9fa]">
              {receipt.modeledUniqueDemand.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-[#828384] line-through font-mono">
              {naive.modeledUniqueDemand.toLocaleString("en-US")}
            </span>
          </div>
          <div className="text-xs text-[#af50ff] font-mono pt-1">
            +{receipt.upliftPercent}% distinct attendees
          </div>
        </div>

        <div className="rounded-[8px] p-5 bg-[#f7f9fa]/[0.03] border border-[#f7f9fa]/10 space-y-2">
          <div className="text-xs font-mono text-[#828384] flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-[#af50ff]" /> Avg Taste Overlap
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono text-[#f7f9fa]">
              {(receipt.avgTasteOverlap * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-[#828384] line-through font-mono">
              {(naive.avgTasteOverlap * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-[#af50ff] font-mono pt-1">
            -{overlapDiff.toFixed(1)} pts cannibalization cut
          </div>
        </div>

        <div className="rounded-[8px] p-5 bg-[#f7f9fa]/[0.03] border border-[#f7f9fa]/10 space-y-2">
          <div className="text-xs font-mono text-[#828384] flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-[#828384]" /> Total Talent Spend
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono text-[#f7f9fa]">
              ${receipt.totalSpent.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-[#828384] font-mono">
              ${naive.totalSpent.toLocaleString("en-US")} naive
            </span>
          </div>
          <div className="text-xs text-[#828384] font-mono pt-1">
            Reserve: ${receipt.remainingBudget.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      {/* Roster Diff Table */}
      <div className="rounded-[8px] border border-[#f7f9fa]/12 overflow-hidden bg-[#090909]">
        <div className="grid grid-cols-2 text-xs font-mono text-[#828384] bg-[#f7f9fa]/[0.04] p-3.5 border-b border-[#f7f9fa]/12 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#af50ff]" />
            <span>The Bill Portfolio Lineup ({receipt.lineup.length} Acts)</span>
          </div>
          <div className="flex items-center gap-2 text-[#828384]">
            <span className="w-2 h-2 rounded-full bg-[#828384]" />
            <span>Naive Top-Popularity Roster ({naive.acts.length} Acts)</span>
          </div>
        </div>

        <div className="divide-y divide-[#f7f9fa]/10 text-xs font-mono">
          {Array.from({ length: Math.max(receipt.lineup.length, naive.acts.length) }).map(
            (_, idx) => {
              const optAct = receipt.lineup[idx];
              const naiveAct = naive.acts[idx];

              return (
                <div key={idx} className="grid grid-cols-2 p-3.5 hover:bg-[#f7f9fa]/[0.02] transition">
                  <div className="flex items-center justify-between pr-4">
                    {optAct ? (
                      <>
                        <span className="font-normal text-[#f7f9fa]">
                          {idx + 1}. {optAct.name}
                        </span>
                        <span className="text-[#828384] text-[11px]">
                          est. ${optAct.fee.toLocaleString("en-US")}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#474747]">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pl-4 border-l border-[#f7f9fa]/10">
                    {naiveAct ? (
                      <>
                        <span className="text-[#828384]">
                          {idx + 1}. {naiveAct.name}
                        </span>
                        <span className="text-[#474747] text-[11px]">
                          est. ${naiveAct.fee.toLocaleString("en-US")}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#474747]">—</span>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
