"use client";

import React from "react";
import { X, Sparkles, Sliders, MapPin, Grid, Layers } from "lucide-react";
import { LineupReceipt, BookedSlot } from "@/lib/solver";
import { BriefState, PRESETS } from "@/components/brief-controls";

interface CinematicOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: BriefState;
  onSelectPreset: (preset: BriefState) => void;
  onOpenMatrix: () => void;
  receipt: LineupReceipt | null;
  onSelectSlot: (slot: BookedSlot) => void;
  onOverrideFee: (actId: string, fee: number) => void;
  isLoading: boolean;
}

export function CinematicOptionsModal({
  isOpen,
  onClose,
  brief,
  onSelectPreset,
  onOpenMatrix,
  receipt,
  onSelectSlot,
  onOverrideFee,
  isLoading,
}: CinematicOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950/95 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                The Bill — Portfolio & Solver Options
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Submodular lineup optimizer grounded in Qloo taste graph
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preset Lineup Options */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <MapPin size={12} /> Select Market & Scenario
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {PRESETS.map((p) => {
              const isActive = brief.market === p.brief.market;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onSelectPreset(p.brief)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-white bg-white/10 text-white shadow-md"
                      : "border-white/10 bg-black/40 text-gray-300 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-semibold">{p.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    ${(p.brief.budget / 1000).toFixed(0)}k · {p.brief.market}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Receipt KPI Summary if solved */}
        {receipt && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/50 border border-white/10 text-xs font-mono">
            <div>
              <span className="text-gray-400 block text-[10px]">TOTAL SPENT</span>
              <span className="text-sm font-semibold text-white">
                ${(receipt.totalSpent / 1000).toFixed(1)}k
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">UNIQUE REACH</span>
              <span className="text-sm font-semibold text-white">
                {Math.round(receipt.modeledUniqueDemand).toLocaleString("en-US")}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">TASTE OVERLAP</span>
              <span className="text-sm font-semibold text-white">
                {receipt.avgTasteOverlap.toFixed(2)} avg
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">SUBMODULAR UPLIFT</span>
              <span className="text-sm font-semibold text-emerald-400">
                +{receipt.upliftPercent !== undefined ? receipt.upliftPercent.toFixed(1) : "0.0"}%
              </span>
            </div>
          </div>
        )}

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenMatrix}
            className="rounded-full liquid-glass px-5 py-2.5 text-xs font-medium text-white hover:text-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Grid size={15} />
            <span>Open Pairwise Taste Overlap Matrix</span>
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {isLoading ? "Solving submodular portfolio..." : "Grounded in 575M+ Qloo entities"}
          </span>
        </div>
      </div>
    </div>
  );
}

