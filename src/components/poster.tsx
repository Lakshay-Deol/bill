"use client";

import React from "react";
import { BookedSlot } from "@/lib/solver";
import { Sparkles, MapPin, Edit2 } from "lucide-react";

interface PosterProps {
  stages: Array<{ stageNumber: number; stageName: string; slots: BookedSlot[] }>;
  onSelectSlot: (slot: BookedSlot) => void;
  selectedSlotId?: string;
  onOverrideFee: (actId: string, fee: number) => void;
}

export function Poster({ stages, onSelectSlot, selectedSlotId, onOverrideFee }: PosterProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map((stage) => (
          <div
            key={stage.stageNumber}
            className="rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400"></span>
                <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-200">
                  {stage.stageName}
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                {stage.slots.length} Booked Slots
              </span>
            </div>

            <div className="space-y-3">
              {stage.slots.map((slot, idx) => {
                const isHeadliner = idx === 0 && stage.stageNumber === 1;
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className={`group relative rounded-xl border p-3.5 transition cursor-pointer ${
                      isSelected
                        ? "border-violet-500 bg-violet-950/30 ring-1 ring-violet-500"
                        : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black tracking-tight text-white ${
                              isHeadliner ? "text-lg sm:text-xl text-violet-200" : "text-sm sm:text-base"
                            }`}
                          >
                            {slot.name}
                          </span>
                          {slot.isLocal && (
                            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <MapPin className="w-2.5 h-2.5" /> Local
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-zinc-400">
                          {slot.genres.slice(0, 3).map((g) => (
                            <span key={g} className="rounded-md bg-zinc-800/60 px-1.5 py-0.5">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Est Fee with Invariant 7 marker */}
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-200">
                          <span className="text-[10px] uppercase text-zinc-500 font-medium">est.</span>
                          <span>${slot.fee.toLocaleString("en-US")}</span>
                          <button
                            type="button"
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
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-zinc-300 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-0.5">user-overridable</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{slot.marginalUnique.toLocaleString("en-US")} unique fans</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {slot.closestActOverlap > 0 ? (
                          <span>
                            {(slot.closestActOverlap * 100).toFixed(0)}% tasteOverlap
                          </span>
                        ) : (
                          <span className="text-zinc-500">0% tasteOverlap</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
