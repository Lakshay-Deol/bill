"use client";

import React, { useState } from "react";
import { BookedSlot } from "@/lib/solver";
import { Sparkles, MapPin, DollarSign, Activity, Check, Edit2 } from "lucide-react";

interface AttributionInspectorProps {
  activeSlot: BookedSlot | null;
  onOverrideFee: (actId: string, fee: number) => void;
}

export function AttributionInspector({
  activeSlot,
  onOverrideFee,
}: AttributionInspectorProps) {
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState("");

  if (!activeSlot) {
    return (
      <div className="p-6 rounded-3xl bg-[#0e0e0e]/80 backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/5 text-center text-xs font-mono text-[#a69fa9] py-12">
        Select an act on the bill to inspect its Qloo attribution receipt.
      </div>
    );
  }

  const handleSaveFee = () => {
    const parsed = parseInt(tempFee, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onOverrideFee(activeSlot.id, parsed);
    }
    setIsEditingFee(false);
  };

  const cpur = (
    activeSlot.fee / Math.max(1, activeSlot.marginalUnique || 1)
  ).toFixed(2);
  const overlapPct = Math.min(
    100,
    Math.round(((activeSlot.closestActOverlap ?? 0) / 0.35) * 100)
  );
  const isOverThreshold = (activeSlot.closestActOverlap ?? 0) > 0.35;

  return (
    <div className="p-6 rounded-3xl bg-[#0e0e0e]/80 backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/5 space-y-4">
      {/* Node Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#cbf230] animate-pulse" />
          <h4 className="font-syne text-sm font-bold text-[#f1eff0] uppercase">
            Attribution Receipt
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-[#1e1e24] text-[#a69fa9] border border-white/10">
            Stage {activeSlot.stage} · Slot #{activeSlot.slotOrder}
          </span>
          <span className="text-[#a69fa9]">
            NODE #{activeSlot.id.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Act Title & Tags */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#dfb7ff]/10 text-[#dfb7ff] border border-[#dfb7ff]/20">
            {activeSlot.genres.slice(0, 2).join(" · ")}
          </span>
          {activeSlot.isLocal && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#cbf230]/15 text-[#cbf230] border border-[#cbf230]/30">
              <MapPin className="w-2.5 h-2.5" /> Local Anchor (+0.15 Geo)
            </span>
          )}
        </div>
        <h4 className="font-syne text-xl uppercase font-bold text-[#f1eff0] tracking-tight">
          {activeSlot.name}
        </h4>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* Talent Fee Box with Quick Edit */}
        <div className="p-3 rounded-xl bg-[#131316] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-[#a69fa9] mb-1">
            <span>TALENT FEE</span>
            <button
              type="button"
              onClick={() => {
                setTempFee(activeSlot.fee.toString());
                setIsEditingFee(!isEditingFee);
              }}
              className="hover:text-[#cbf230] text-[#a69fa9] transition-colors"
              title="Override Talent Fee"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          </div>
          {isEditingFee ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={tempFee}
                onChange={(e) => setTempFee(e.target.value)}
                className="w-full bg-[#070709] border border-[#cbf230] rounded px-1.5 py-0.5 text-xs text-[#f1eff0] font-mono focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveFee}
                className="p-1 rounded bg-[#cbf230] text-[#09090b]"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="font-bold text-[#f1eff0]">
              est. ${activeSlot.fee.toLocaleString("en-US")}
            </span>
          )}
        </div>

        {/* Marginal Gain */}
        <div className="p-3 rounded-xl bg-[#131316] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-[#a69fa9] block mb-1">MARGINAL GAIN</span>
          <span className="font-bold text-[#cbf230]">
            +{(activeSlot.marginalUnique ?? 0).toLocaleString("en-US")} fans
          </span>
        </div>

        {/* CPUR */}
        <div className="p-3 rounded-xl bg-[#131316] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-[#a69fa9] block mb-1">CPUR (EST.)</span>
          <span className="font-bold text-[#f1eff0]">${cpur} / fan</span>
        </div>

        {/* Popularity Decile */}
        <div className="p-3 rounded-xl bg-[#131316] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-[#a69fa9] block mb-1">QLOO POPULARITY</span>
          <span className="font-bold text-[#dfb7ff]">
            {activeSlot.popularity}/100
          </span>
        </div>
      </div>

      {/* Cannibalization & Overlap Inspector */}
      <div className="p-3 rounded-2xl bg-[#131316]/90 border border-white/5 space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[#a69fa9]">MAX PAIR TASTEOVERLAP</span>
          <span
            className={`font-bold ${
              isOverThreshold ? "text-[#ffb4a3]" : "text-[#dfb7ff]"
            }`}
          >
            {(activeSlot.closestActOverlap ?? 0).toFixed(2)} / 0.35 CAP
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-[#1e1e24] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isOverThreshold ? "bg-[#fc5a36]" : "bg-[#cbf230]"
            }`}
            style={{ width: `${overlapPct}%` }}
          />
        </div>

        {activeSlot.closestActName && (
          <div className="text-[10px] text-[#a69fa9] pt-1 flex items-center justify-between border-t border-white/5">
            <span>Nearest Taste Neighbor:</span>
            <span className="text-[#f1eff0] font-medium truncate max-w-[140px]">
              {activeSlot.closestActName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

