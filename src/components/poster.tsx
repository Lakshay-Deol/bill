"use client";

import React from "react";
import { BookedSlot } from "@/lib/solver";
import { MapPin } from "lucide-react";

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
            className="card-dope p-6 sm:p-8 space-y-6"
          >
            {/* Stage Title in Whyte Inktrap Mono */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f7f9fa]/10">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    stage.stageNumber === 1 ? "bg-[#af50ff]" : "bg-[#f7f9fa]"
                  }`}
                />
                <h3 className="text-sm font-mono font-medium tracking-[0.14em] uppercase text-[#f7f9fa]">
                  {stage.stageName}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#828384] tracking-wider uppercase">
                {stage.slots.length} SLOTS
              </span>
            </div>

            {/* Acts List */}
            <div className="space-y-3">
              {stage.slots.map((slot, idx) => {
                const isHeadliner = idx === 0 && stage.stageNumber === 1;
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className={`rounded-[8px] p-4 border transition cursor-pointer ${
                      isSelected
                        ? "border-[#af50ff] bg-[#af50ff]/[0.08]"
                        : "border-[#f7f9fa]/12 bg-[#090909] hover:border-[#af50ff]/40 hover:bg-[#f7f9fa]/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-normal tracking-tight text-[#f7f9fa] ${
                              isHeadliner
                                ? "text-lg sm:text-xl font-medium"
                                : "text-sm sm:text-base"
                            }`}
                          >
                            {slot.name}
                          </span>
                          {slot.isLocal && (
                            <span className="inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#f7f9fa]/[0.06] text-[#af50ff] border border-[#af50ff]/30">
                              <MapPin className="w-2.5 h-2.5" /> Local
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#828384] font-mono">
                          {slot.genres.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="rounded-[4px] bg-[#f7f9fa]/[0.04] border border-[#f7f9fa]/10 px-2 py-0.5 text-[10px] uppercase"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Est Fee with Invariant 7 marker */}
                      <div className="text-right flex flex-col items-end flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs font-mono text-[#f7f9fa]">
                          <span className="text-[10px] uppercase text-[#828384]">est.</span>
                          <span>${slot.fee.toLocaleString("en-US")}</span>
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
                            className="ml-1 text-[10px] uppercase text-[#828384] hover:text-[#af50ff] underline"
                          >
                            edit
                          </button>
                        </div>
                        <span className="text-[10px] text-[#828384] font-mono mt-0.5">
                          +{(slot.marginalUnique ?? 0).toLocaleString("en-US")} reach
                        </span>
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
