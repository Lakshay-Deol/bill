"use client";

import React, { useState } from "react";
import { BookedSlot, LineupReceipt } from "@/lib/solver";
import { X, Network, Info, ShieldCheck } from "lucide-react";

interface MatrixModalProps {
  receipt: LineupReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export function MatrixModal({ receipt, isOpen, onClose }: MatrixModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(receipt.lineup[0] ?? null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto card-dope p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#f7f9fa]/12 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#af50ff]">
              <Network className="w-4 h-4" />
              <span>QLOO TASTE GRAPH // PAIRWISE AFFINITY MATRIX</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal text-[#f7f9fa] tracking-tight">
              Taste Overlap Inspector
            </h2>
            <p className="text-xs sm:text-sm text-[#828384] font-light">
              Inspect cosine similarity between booked acts. Lower overlap = higher net ticket buyer diversification.
            </p>
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

        {/* Roster Selector Strip */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#828384] uppercase tracking-wider block">
            SELECT ACT TO INSPECT AFFINITY PROFILE:
          </span>
          <div className="flex flex-wrap gap-2">
            {receipt.lineup.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition border ${
                    isSelected
                      ? "bg-[#af50ff] text-[#090909] font-medium border-[#af50ff]"
                      : "bg-[#090909] text-[#828384] border-[#f7f9fa]/12 hover:border-[#f7f9fa]/30 hover:text-[#f7f9fa]"
                  }`}
                >
                  {slot.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Act Deep Dive */}
        {selectedSlot && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[8px] bg-[#090909] border border-[#f7f9fa]/12 space-y-3">
              <div className="text-[10px] font-mono text-[#828384] uppercase tracking-wider">
                INSPECTED ACT METADATA
              </div>
              <div className="text-xl font-normal text-[#f7f9fa]">{selectedSlot.name}</div>
              <div className="text-xs font-mono text-[#828384]">
                Stage {selectedSlot.stage} &bull; Slot #{selectedSlot.slotOrder}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSlot.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#f7f9fa]/[0.05] border border-[#f7f9fa]/10 text-[#828384] uppercase"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-[#f7f9fa]/10 text-xs text-[#828384] font-mono">
                <span>Marginal Reach: </span>
                <strong className="text-[#f7f9fa]">
                  +{selectedSlot.marginalUnique.toLocaleString("en-US")} fans
                </strong>
              </div>
            </div>

            <div className="p-5 rounded-[8px] bg-[#090909] border border-[#f7f9fa]/12 space-y-3">
              <div className="text-[10px] font-mono text-[#af50ff] uppercase tracking-wider flex items-center justify-between">
                <span>CLOSEST OVERLAPPING ACT</span>
                <span>COSINE SIMILARITY</span>
              </div>
              <div className="text-lg font-normal text-[#f7f9fa]">
                {selectedSlot.closestActName ?? "None (No overlapping acts)"}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#828384]">Pairwise tasteOverlap:</span>
                  <span className="text-[#af50ff] font-bold">
                    {(selectedSlot.closestActOverlap * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#f7f9fa]/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#af50ff] transition-all duration-300"
                    style={{ width: `${Math.min(100, selectedSlot.closestActOverlap * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#828384] font-mono flex items-start gap-2 pt-2 border-t border-[#f7f9fa]/10">
                <Info className="w-3.5 h-3.5 text-[#af50ff] flex-shrink-0 mt-0.5" />
                <span>
                  Derived from Qloo cultural embeddings. Lower affinity guarantees distinct festival buyer demographics.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Table Overview */}
        <div className="rounded-[8px] border border-[#f7f9fa]/12 overflow-hidden bg-[#090909]">
          <div className="grid grid-cols-4 text-xs font-mono text-[#828384] bg-[#f7f9fa]/[0.04] p-3 border-b border-[#f7f9fa]/12 uppercase">
            <span className="col-span-2">Act</span>
            <span className="text-right">Est. Fee</span>
            <span className="text-right">Closest Overlap</span>
          </div>
          <div className="divide-y divide-[#f7f9fa]/10 text-xs font-mono">
            {receipt.lineup.map((slot) => (
              <div
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className="grid grid-cols-4 p-3 hover:bg-[#f7f9fa]/[0.03] transition cursor-pointer"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-[#828384] text-[10px]">S{slot.stage}</span>
                  <span className="text-[#f7f9fa]">{slot.name}</span>
                </div>
                <div className="text-right text-[#828384]">
                  est. ${slot.fee.toLocaleString("en-US")}
                </div>
                <div className="text-right text-[#af50ff]">
                  {(slot.closestActOverlap * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#f7f9fa]/12 text-xs font-mono text-[#828384]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#af50ff]" />
            Avg Lineup Taste Overlap: {(receipt.avgTasteOverlap * 100).toFixed(1)}%
          </span>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="btn-compact-outlined text-xs py-1.5 px-4 font-mono uppercase"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
