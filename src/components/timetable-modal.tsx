"use client";

import React from "react";
import { LineupReceipt } from "@/lib/solver";
import { X, Clock, MapPin, Calendar } from "lucide-react";

interface TimetableModalProps {
  receipt: LineupReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export function TimetableModal({ receipt, isOpen, onClose }: TimetableModalProps) {
  if (!isOpen) return null;

  const getSlotTiming = (slotIndex: number, totalSlots: number) => {
    const startHour = 15 + Math.floor((slotIndex / Math.max(1, totalSlots)) * 7);
    const startMin = (slotIndex * 15) % 60;
    const endHour = startHour + 1;
    const endMin = (startMin + 15) % 60;
    const formatTime = (h: number, m: number) =>
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return `${formatTime(startHour, startMin)} – ${formatTime(endHour, endMin)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto card-dope p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f7f9fa]/12 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#af50ff] mb-1">
              <Calendar className="w-4 h-4" />
              <span>RUN OF SHOW // FLIGHT SCHEDULE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal text-[#f7f9fa] tracking-tight">
              Festival Timetable & Set Schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#828384] font-light">
              Stage programming with conflict minimization and marginal demand pacing.
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

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {receipt.stages.map((stage) => {
            const sortedSlots = [...stage.slots].sort((a, b) => b.slotOrder - a.slotOrder);

            return (
              <div key={stage.stageNumber} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f7f9fa]/12">
                  <span className="text-xs font-mono font-medium text-[#f7f9fa] uppercase tracking-wider flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stage.stageNumber === 1 ? "bg-[#af50ff]" : "bg-[#f7f9fa]"
                      }`}
                    />
                    {stage.stageName}
                  </span>
                  <span className="text-[11px] text-[#828384] font-mono">
                    {stage.slots.length} SETS SCHEDULED
                  </span>
                </div>

                <div className="space-y-2.5">
                  {sortedSlots.map((slot, idx) => {
                    const isHeadliner = slot.slotOrder === 1;
                    const timeString = getSlotTiming(idx, sortedSlots.length);

                    return (
                      <div
                        key={slot.id}
                        className={`rounded-[8px] p-4 border transition ${
                          isHeadliner
                            ? "bg-[#af50ff]/10 border-[#af50ff]/40"
                            : "bg-[#090909] border-[#f7f9fa]/12 hover:border-[#f7f9fa]/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#828384] font-mono">
                              <Clock className="w-3.5 h-3.5 text-[#af50ff]" />
                              <span>{timeString}</span>
                              {isHeadliner && (
                                <span className="ml-1.5 px-2 py-0.5 rounded-[4px] bg-[#af50ff] text-[#090909] text-[9px] font-mono uppercase tracking-wider font-bold">
                                  HEADLINER
                                </span>
                              )}
                            </div>
                            <div className="text-base font-normal text-[#f7f9fa]">
                              {slot.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#828384] font-mono">
                              {slot.isLocal && (
                                <span className="inline-flex items-center gap-1 text-[#af50ff]">
                                  <MapPin className="w-2.5 h-2.5" /> Local
                                </span>
                              )}
                              <span>{slot.genres[0]}</span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className="text-xs text-[#828384] font-mono">
                              est. ${slot.fee.toLocaleString("en-US")}
                            </span>
                            <span className="text-xs text-[#f7f9fa] font-mono mt-1">
                              +{slot.marginalUnique.toLocaleString("en-US")} fans
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#f7f9fa]/12 text-xs font-mono text-[#828384]">
          <span>Run of show computed deterministically</span>
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="btn-compact-outlined text-xs py-1.5 px-4 font-mono uppercase"
          >
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
}
