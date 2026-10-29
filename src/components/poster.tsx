"use client";

import React from "react";
import { BookedSlot } from "@/lib/solver";
import { MapPin, Sparkles, ExternalLink } from "lucide-react";

interface PosterProps {
  stages: Array<{ stageNumber: number; stageName: string; slots: BookedSlot[] }>;
  onSelectSlot: (slot: BookedSlot) => void;
  selectedSlotId?: string;
  onOverrideFee: (actId: string, fee: number) => void;
}

export function Poster({
  stages,
  onSelectSlot,
  selectedSlotId,
  onOverrideFee,
}: PosterProps) {
  const allSlots = stages.flatMap((s) => s.slots);
  // Sort descending by fee to tier appropriately
  const sorted = [...allSlots].sort((a, b) => b.fee - a.fee);
  const tier1 = sorted.slice(0, 2);
  const tier2 = sorted.slice(2, 5);
  const tier3 = sorted.slice(5);

  const renderActCard = (slot: BookedSlot, tier: 1 | 2 | 3) => {
    const isSelected = selectedSlotId === slot.id;

    return (
      <div
        key={slot.id}
        onClick={() => onSelectSlot(slot)}
        className={`artist-card rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer backdrop-blur-md relative overflow-hidden ${
          isSelected
            ? "border-[#cbf230] bg-[#cbf230]/10 shadow-[0_0_20px_rgba(203,242,48,0.2)]"
            : "border-white/10 bg-[#070709]/80 hover:border-white/30 hover:bg-white/5"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-syne font-bold uppercase text-[#f1eff0] tracking-tight ${
                  tier === 1 ? "text-xl sm:text-2xl" : tier === 2 ? "text-base sm:text-lg" : "text-sm sm:text-base"
                }`}
              >
                {slot.name}
              </span>

              {slot.isLocal && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase bg-[#cbf230]/10 text-[#cbf230] border border-[#cbf230]/30 font-bold">
                  <MapPin className="w-2.5 h-2.5" /> Austin Local Anchor
                </span>
              )}

              {slot.closestActOverlap !== undefined && (
                <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-[#a69fa9] uppercase">
                  {slot.closestActOverlap.toFixed(2)} overlap
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#a69fa9] font-mono">
              {slot.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] uppercase"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Fee with strict Invariant 7 marker and edit trigger */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
            <div className="flex items-center gap-1.5 font-mono text-sm">
              <span className="text-[10px] uppercase text-[#a69fa9]">est.</span>
              <span className="font-bold text-[#f1eff0]">
                ${slot.fee.toLocaleString("en-US")}
              </span>
              <button
                type="button"
                suppressHydrationWarning
                title="Override estimated fee"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = window.prompt(
                    `Override estimated fee for ${slot.name}:`,
                    String(slot.fee)
                  );
                  if (input && !isNaN(Number(input))) {
                    onOverrideFee(slot.id, Number(input));
                  }
                }}
                className="text-[10px] uppercase text-[#cbf230] hover:underline cursor-pointer"
              >
                edit
              </button>
            </div>

            <span className="text-[11px] text-[#a69fa9] font-mono">
              +{(slot.marginalUnique ?? 0).toLocaleString("en-US")} distinct reach
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* TIER 1: BLUE CHIP HEADLINERS */}
      <div className="space-y-3">
        <div className="border-b border-white/10 pb-2">
          <span className="font-mono text-[11px] text-[#dfb7ff] uppercase tracking-widest font-semibold">
            TIER 1 · BLUE-CHIP HEADLINERS
          </span>
        </div>
        <div className="space-y-3">
          {tier1.map((slot) => renderActCard(slot, 1))}
        </div>
      </div>

      {/* TIER 2: ASYMMETRIC GROWTH MID-TIER */}
      {tier2.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="border-b border-white/10 pb-2">
            <span className="font-mono text-[11px] text-[#cbf230] uppercase tracking-widest font-semibold">
              TIER 2 · ASYMMETRIC GROWTH MID-TIER
            </span>
          </div>
          <div className="space-y-3">
            {tier2.map((slot) => renderActCard(slot, 2))}
          </div>
        </div>
      )}

      {/* TIER 3: SEED TALENT & OPENERS */}
      {tier3.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="border-b border-white/10 pb-2">
            <span className="font-mono text-[11px] text-[#ffb4a3] uppercase tracking-widest font-semibold">
              TIER 3 · SEED TALENT & LOCAL OPENERS
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tier3.map((slot) => renderActCard(slot, 3))}
          </div>
        </div>
      )}
    </div>
  );
}
