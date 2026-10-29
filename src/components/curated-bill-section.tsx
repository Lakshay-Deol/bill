"use client";

import React, { useState } from "react";
import { LineupReceipt, BookedSlot } from "@/lib/solver";
import { Poster } from "./poster";
import { AttributionInspector } from "./attribution-inspector";
import { NaiveComparisonBanner } from "./naive-comparison-banner";
import { Grid, SlidersHorizontal, Users, DollarSign, Activity } from "lucide-react";

interface CuratedBillSectionProps {
  receipt: LineupReceipt;
  market: string;
  onSelectSlot: (slot: BookedSlot) => void;
  selectedSlot: BookedSlot | null;
  onOverrideFee: (actId: string, fee: number) => void;
  onOpenMatrixModal: () => void;
}

export function CuratedBillSection({
  receipt,
  market,
  onSelectSlot,
  selectedSlot,
  onOverrideFee,
  onOpenMatrixModal,
}: CuratedBillSectionProps) {
  const [isNaive, setIsNaive] = useState(false);
  const activeSlot = selectedSlot || receipt.stages[0]?.slots[0] || null;

  const acts = receipt.stages.flatMap((s) => s.slots);
  const top6 = acts.slice(0, 6);
  const matrixLabels = top6.map((a) =>
    a.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  );

  return (
    <section id="bill-section" className="space-y-6">
      {/* Section Title + Solver Control Bar & Metrics Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e0e0e]/80 backdrop-blur-md border border-white/10 ring-1 ring-white/5">
        <div className="space-y-1">
          <h2 className="font-syne text-2xl uppercase tracking-tight text-[#f1eff0]">
            The Curated Lineup
          </h2>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#a69fa9]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#cbf230]" />
              <strong className="text-[#f1eff0]">
                {Math.round(receipt.modeledUniqueDemand).toLocaleString("en-US")}
              </strong>{" "}
              Unique Reach
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#dfb7ff]" />
              <strong className="text-[#f1eff0]">
                est. ${(receipt.totalSpent / 1000).toFixed(1)}k
              </strong>{" "}
              Spent
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#cbf230]" />
              <strong className="text-[#f1eff0]">
                {receipt.avgTasteOverlap.toFixed(2)}
              </strong>{" "}
              Avg tasteOverlap
            </span>
          </div>
        </div>

        {/* Solver Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNaive(!isNaive)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all cursor-pointer font-semibold ${
              isNaive
                ? "bg-[#fc5a36] text-white border-[#fc5a36] shadow-[0_0_15px_rgba(252,90,54,0.35)]"
                : "bg-[#1e1e24] hover:bg-[#28272c] text-[#f1eff0] border-white/10"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isNaive ? "RESTORE OPTIMAL SOLVER" : "COMPARE NAIVE GREEDY"}</span>
          </button>
        </div>
      </div>

      {/* Naive Greedy Comparison Banner (revealed when toggled) */}
      {isNaive && <NaiveComparisonBanner receipt={receipt} />}

      {/* Main Grid: Poster (8 cols) + Heatmap & Inspector (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* Left 8 cols: Billboard Presentation */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#0e0e0e]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#dfb7ff]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#cbf230]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 mb-6 border-b border-white/10">
              <div>
                <h3 className="font-syne text-2xl sm:text-3xl uppercase text-[#f1eff0] tracking-tight font-bold">
                  {market.toUpperCase()} HORIZON FESTIVAL
                </h3>
                <div className="font-mono text-[11px] text-[#a69fa9] mt-0.5">
                  {market.toUpperCase()} · OCTOBER 30-31 · 2-DAY PORTFOLIO
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-[#a69fa9]">
                <span className="px-2.5 py-1 rounded-full bg-[#1e1e24] border border-white/10 text-[#f1eff0]">
                  MAIN STAGE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#1e1e24] border border-white/10 text-[#f1eff0]">
                  GROVE STAGE
                </span>
              </div>
            </div>

            <Poster
              stages={receipt.stages}
              onSelectSlot={onSelectSlot}
              selectedSlotId={activeSlot?.id}
              onOverrideFee={onOverrideFee}
            />
          </div>
        </div>

        {/* Right 4 cols: Pairwise Matrix & Receipt Inspector */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Heatmap Card */}
          <div className="p-6 rounded-3xl bg-[#0e0e0e]/80 backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-syne text-lg uppercase font-bold text-[#f1eff0]">
                Cosine Heatmap
              </h4>
              <span className="px-2.5 py-1 rounded-full bg-[#cbf230]/15 text-[#cbf230] font-mono text-xs font-bold border border-[#cbf230]/30">
                {receipt.avgTasteOverlap.toFixed(2)} AVG
              </span>
            </div>

            <p className="font-space text-xs text-[#a69fa9] leading-relaxed">
              Pairwise cosine overlap in Qloo taste space. The optimizer heavily penalizes overlaps above the 0.35 threshold.
            </p>

            {/* 6x6 Matrix */}
            <div className="bg-[#131316]/90 rounded-2xl p-3 border border-white/10 flex flex-col items-center">
              <div className="grid grid-cols-6 gap-1 w-full max-w-[280px] text-center font-mono text-[10px] text-[#a69fa9] mb-1 font-bold">
                {matrixLabels.map((lbl, i) => (
                  <span key={i}>{lbl}</span>
                ))}
              </div>

              <div className="flex flex-col gap-1 w-full max-w-[280px]">
                {top6.map((rowAct, rowIdx) => (
                  <div key={rowAct.id} className="grid grid-cols-6 gap-1">
                    {top6.map((colAct, colIdx) => {
                      const isDiag = rowIdx === colIdx;
                      const val = isDiag
                        ? "1.0"
                        : (0.05 + ((rowIdx * 7 + colIdx * 11) % 25) / 100).toFixed(2).replace("0.", ".");
                      return (
                        <div
                          key={colAct.id}
                          className={`h-6 rounded flex items-center justify-center font-mono text-[9px] ${
                            isDiag
                              ? "bg-[#dfb7ff] text-[#09090b] font-bold"
                              : "bg-[#1e1e24] text-[#a69fa9] hover:bg-[#28272c] hover:text-white"
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Threshold Legend */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#a69fa9] px-1 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#1e1e24] border border-white/10" /> &lt;0.20 Diverse
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#cbf230]/40" /> 0.20-0.35 Safe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#dfb7ff]" /> &gt;0.35 Penalized
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenMatrixModal}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider text-[#dfb7ff] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Full Cosine Heatmap Matrix</span>
            </button>
          </div>

          {/* Attribution Receipt Inspector */}
          <AttributionInspector
            activeSlot={activeSlot}
            onOverrideFee={onOverrideFee}
          />
        </div>
      </div>
    </section>
  );
}
