"use client";

import React from "react";
import { BookedSlot } from "@/lib/solver";
import { X, Sparkles, TrendingUp, Info, DollarSign } from "lucide-react";

interface DrawerProps {
  slot: BookedSlot | null;
  onClose: () => void;
  onOverrideFee: (actId: string, fee: number) => void;
}

export function Drawer({ slot, onClose, onOverrideFee }: DrawerProps) {
  if (!slot) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-950/95 border-l border-zinc-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">
              Stage {slot.stage} &bull; Slot #{slot.slotOrder}
            </span>
            <h2 className="text-2xl font-black text-white mt-1">{slot.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Marginal Value Receipt */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Marginal Unique Demand</span>
          </div>
          <div className="text-3xl font-black text-emerald-300">
            +{slot.marginalUnique.toLocaleString()} fans
          </div>
          <p className="text-[11px] text-zinc-400">
            Net incremental attendees after penalizing taste overlap with previously booked acts.
          </p>
        </div>

        {/* Pairwise Taste Overlap Attribution */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              <span>Closest Booked Act</span>
            </span>
            <span className="font-mono text-violet-300">
              {(slot.closestActOverlap * 100).toFixed(1)}% tasteOverlap
            </span>
          </div>

          <div className="text-sm font-bold text-zinc-100">
            {slot.closestActName ?? "None (No overlapping acts)"}
          </div>

          {/* Overlap Gauge */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, slot.closestActOverlap * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-500 flex-shrink-0" />
            <span>Cosine similarity of Qloo embedding vectors across top-50 neighborhoods.</span>
          </p>
        </div>

        {/* Financials & Overrides */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimated Fee
            </span>
            <span className="text-xs font-mono font-bold text-zinc-100">
              est. ${slot.fee.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const val = window.prompt(`Enter custom fee for ${slot.name}:`, String(slot.fee));
              if (val && !isNaN(Number(val))) {
                onOverrideFee(slot.id, Number(val));
              }
            }}
            className="w-full py-2 rounded-lg border border-zinc-700 bg-zinc-800/60 text-xs font-semibold text-zinc-200 hover:border-violet-500 hover:text-white transition"
          >
            Override Fee Estimate
          </button>
        </div>

        {/* Genres & Details */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Mapped Taste Profile
          </span>
          <div className="flex flex-wrap gap-1.5">
            {slot.genres.map((g) => (
              <span
                key={g}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
}
