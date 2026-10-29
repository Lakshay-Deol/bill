"use client";

import React, { useState } from "react";
import { LineupReceipt } from "@/lib/solver";
import { X, Copy, Check, Printer, ShieldCheck } from "lucide-react";

interface PosterModalProps {
  receipt: LineupReceipt;
  market: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PosterModal({ receipt, market, isOpen, onClose }: PosterModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = [
      `=== CROWDFOLIO FESTIVAL 2026 // ${market.toUpperCase()} ===`,
      `Grounded in Qloo Taste Graph AI`,
      `Modeled Unique Demand: ${receipt.modeledUniqueDemand.toLocaleString("en-US")} attendees (+${receipt.upliftPercent}% uplift)`,
      `Avg Taste Overlap: ${(receipt.avgTasteOverlap * 100).toFixed(1)}%`,
      ``,
      ...receipt.stages.flatMap((s) => [
        `[ ${s.stageName.toUpperCase()} ]`,
        ...s.slots.map(
          (act) => `  - ${act.name} (est. $${act.fee.toLocaleString("en-US")})`
        ),
        ``,
      ]),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto card-dope p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f7f9fa]/12 pb-5">
          <div className="text-xs font-mono text-[#af50ff] uppercase tracking-wider">
            FESTIVAL POSTER STUDIO
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleCopy}
              className="btn-compact-outlined text-xs py-1.5 px-3 font-mono"
            >
              {copied ? <Check className="w-3 h-3 mr-1 text-[#af50ff]" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? "COPIED" : "COPY ROSTER"}
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={handlePrint}
              className="btn-compact-outlined text-xs py-1.5 px-3 font-mono"
            >
              <Printer className="w-3 h-3 mr-1" />
              PRINT
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#828384] hover:text-[#f7f9fa] hover:bg-[#f7f9fa]/10 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Canvas */}
        <div className="p-8 sm:p-12 rounded-[16px] bg-[#090909] border border-[#f7f9fa]/15 text-center space-y-8 relative overflow-hidden">
          {/* Poster Title */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-mono tracking-[0.25em] text-[#af50ff] uppercase">
              QLOO CULTURAL TASTE GRAPH PRESENTS
            </div>
            <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.03em] text-[#f7f9fa] uppercase">
              CROWDFOLIO
            </h1>
            <div className="text-xs font-mono text-[#828384] tracking-[0.2em] uppercase">
              {market} &bull; 2026 EDITION
            </div>
          </div>

          {/* Lineup Layout */}
          <div className="space-y-6 pt-4 max-w-xl mx-auto">
            {receipt.stages.map((stage) => {
              const headliner = stage.slots[0];
              const support = stage.slots.slice(1);

              return (
                <div key={stage.stageNumber} className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#828384] border-b border-[#f7f9fa]/10 pb-1">
                    {stage.stageName}
                  </div>
                  {headliner && (
                    <div className="text-2xl sm:text-4xl font-normal text-[#f7f9fa] tracking-tight uppercase hover:text-[#af50ff] transition cursor-default">
                      {headliner.name}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:text-base font-normal text-[#828384]">
                    {support.map((act) => (
                      <span key={act.id} className="hover:text-white transition">
                        {act.name}
                        {act.isLocal && (
                          <span className="text-[10px] text-[#af50ff] ml-1 font-mono">
                            *LOCAL
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Badge */}
          <div className="pt-8 border-t border-[#f7f9fa]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#828384] font-mono gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#af50ff]" />
              <span>Grounded in Qloo Taste Graph</span>
            </div>
            <div>
              Unique Demand: {receipt.modeledUniqueDemand.toLocaleString("en-US")} attendees (+{receipt.upliftPercent}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
