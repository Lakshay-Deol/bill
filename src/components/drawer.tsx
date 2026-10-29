"use client";

import React from "react";
import { BookedSlot } from "@/lib/solver";
import { X, TrendingUp, Info, DollarSign } from "lucide-react";

interface DrawerProps {
  slot: BookedSlot | null;
  onClose: () => void;
  onOverrideFee: (actId: string, fee: number) => void;
}

export function Drawer({ slot, onClose, onOverrideFee }: DrawerProps) {
  if (!slot) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#090909] border-l border-[#f7f9fa]/15 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#f7f9fa]/12">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#af50ff]">
              STAGE {slot.stage} // SLOT #{slot.slotOrder}
            </span>
            <h2 className="text-2xl font-normal text-[#f7f9fa] mt-1 tracking-tight">
              {slot.name}
            </h2>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-[#828384] hover:text-[#f7f9fa] hover:bg-[#f7f9fa]/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Marginal Demand Receipt */}
        <div className="rounded-[8px] border border-[#f7f9fa]/15 bg-[#f7f9fa]/[0.03] p-5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#af50ff]">
            MARGINAL UNIQUE DEMAND
          </div>
          <div className="text-3xl font-mono text-[#f7f9fa]">
            +{slot.marginalUnique.toLocaleString("en-US")} fans
          </div>
          <p className="text-[13px] text-[#828384] font-light leading-relaxed">
            Net incremental distinct ticket-buyers delivered after penalizing taste overlap with previously selected lineup acts.
          </p>
        </div>

        {/* Pairwise Taste Overlap Attribution (Invariant 6) */}
        <div className="rounded-[8px] border border-[#f7f9fa]/12 bg-[#090909] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#828384] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#af50ff]" /> Closest Act In Lineup
            </span>
            <span className="text-[#af50ff]">
              {(slot.closestActOverlap * 100).toFixed(1)}% tasteOverlap
            </span>
          </div>

          <div className="text-base font-normal text-[#f7f9fa]">
            {slot.closestActName ?? "None (No overlapping acts)"}
          </div>

          {/* Overlap Gauge */}
          <div className="w-full bg-[#f7f9fa]/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#af50ff] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, slot.closestActOverlap * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-[#828384] font-mono flex items-start gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-[#828384] flex-shrink-0 mt-0.5" />
            <span>Cosine similarity of Qloo embedding vectors across top-50 neighborhoods.</span>
          </p>
        </div>

        {/* Financials & Overrides (Invariant 7) */}
        <div className="rounded-[8px] border border-[#f7f9fa]/12 bg-[#090909] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#828384] uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#828384]" /> Estimated Fee
            </span>
            <span className="text-sm font-mono text-[#f7f9fa]">
              est. ${slot.fee.toLocaleString("en-US")}
            </span>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              const val = window.prompt(`Enter custom fee for ${slot.name}:`, String(slot.fee));
              if (val && !isNaN(Number(val))) {
                onOverrideFee(slot.id, Number(val));
              }
            }}
            className="w-full py-2.5 rounded-[6px] border border-[#f7f9fa]/20 bg-[#f7f9fa]/[0.06] text-xs font-mono uppercase tracking-wider text-[#f7f9fa] hover:border-[#af50ff] hover:text-[#af50ff] transition"
          >
            Override Estimated Fee
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-[#f7f9fa]/10 text-center">
        <button
          type="button"
          suppressHydrationWarning
          onClick={onClose}
          className="btn-filled-action w-full text-xs py-2.5 rounded-[6px] uppercase font-mono tracking-wider"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
