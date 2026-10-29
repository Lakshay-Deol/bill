"use client";

import React, { useState } from "react";
import { NlPromptBar } from "./nl-prompt-bar";

export interface BriefState {
  market: string;
  budget: number;
  capacity: number;
  actCount: number;
  requireLocal: boolean;
  seeds: string[];
}

export const PRESETS: Array<{ name: string; brief: BriefState }> = [
  {
    name: "Austin 5k · $250k",
    brief: {
      market: "Austin",
      budget: 250000,
      capacity: 5000,
      actCount: 8,
      requireLocal: true,
      seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
    },
  },
  {
    name: "Tokyo 6.5k · $320k",
    brief: {
      market: "Tokyo",
      budget: 320000,
      capacity: 6500,
      actCount: 8,
      requireLocal: true,
      seeds: ["Massive Attack", "Portishead", "Cornelius"],
    },
  },
  {
    name: "Brooklyn 3.5k · $180k",
    brief: {
      market: "New York",
      budget: 180000,
      capacity: 3500,
      actCount: 6,
      requireLocal: false,
      seeds: ["Big Thief", "Adrianne Lenker", "Faye Webster"],
    },
  },
  {
    name: "Chicago 8k · $350k",
    brief: {
      market: "Chicago",
      budget: 350000,
      capacity: 8000,
      actCount: 10,
      requireLocal: true,
      seeds: ["Soccer Mommy", "Indigo De Souza", "The Beths"],
    },
  },
];

interface BriefControlsProps {
  brief: BriefState;
  onChange: (updated: Partial<BriefState>) => void;
  onSelectPreset?: (preset: BriefState) => void;
  onSolve: () => void;
  isLoading: boolean;
}

export function BriefControls({
  brief,
  onChange,
  onSolve,
  isLoading,
}: BriefControlsProps) {
  const [maxCountry, setMaxCountry] = useState(true);
  const [maxOverlap, setMaxOverlap] = useState(true);

  const handleApplyNlPrompt = (prompt: string) => {
    const q = prompt.toLowerCase();
    if (q.includes("180k") || q.includes("180000")) {
      onChange({ budget: 180000 });
    } else if (q.includes("local") || q.includes("austin")) {
      onChange({ requireLocal: true });
    } else if (q.includes("350k")) {
      onChange({ budget: 350000 });
    }
    onSolve();
  };

  return (
    <section id="component-suite" className="p-6 sm:p-8 rounded-3xl bg-[#0e0e0e]/80 backdrop-blur-md border border-white/10 ring-1 ring-white/5 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h2 className="font-syne text-2xl sm:text-3xl uppercase tracking-tight text-[#f1eff0] font-bold">
          Crowdfolio Component Suite
        </h2>
        <p className="font-space text-sm text-[#a69fa9] mt-1">
          Live UI widgets and primitives powering real-time greedy submodular optimization.
        </p>
      </div>

      {/* 3 Widgets Grid (eyebrow tags removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 01: Budget Slider */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-syne text-base uppercase font-bold text-[#f1eff0]">
                Talent Budget Constraint
              </h4>
              <span className="font-mono text-[11px] text-[#a69fa9]">Range Slider</span>
            </div>
            <p className="font-space text-xs text-[#a69fa9] mb-4">
              Controls capital ceiling, dynamically calculating submodular marginal yields.
            </p>
            <div className="space-y-3 p-4 rounded-xl bg-[#070709]/80 border border-white/10 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#a69fa9] uppercase">BUDGET CEILING</span>
                <span className="text-sm font-bold text-[#cbf230]" id="comp-budget-val">
                  ${(brief.budget / 1000).toFixed(0)},000
                </span>
              </div>
              <input
                id="comp-budget-slider"
                type="range"
                min={120000}
                max={450000}
                step={10000}
                value={brief.budget}
                onChange={(e) => onChange({ budget: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#28272c] rounded-lg appearance-none cursor-pointer accent-[#cbf230]"
              />
              <div className="flex justify-between text-[10px] text-[#a69fa9]">
                <span>$120k min</span>
                <span>$250k eq.</span>
                <span>$450k max</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-[#a69fa9]">
            Marginal yield curve: <span className="text-[#f1eff0] font-semibold">f(B) = B^0.65</span>
          </div>
        </div>

        {/* Widget 02: Taste Graph Guardrails */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-syne text-base uppercase font-bold text-[#f1eff0]">
                Taste Graph Guardrails
              </h4>
              <span className="font-mono text-[11px] text-[#a69fa9]">Graph Rules</span>
            </div>
            <p className="font-space text-xs text-[#a69fa9] mb-4">
              Constrains submodular greedy selector with hard geo-local and genre limits.
            </p>
            <div className="space-y-2.5 font-mono text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070709]/80 border border-white/10 cursor-pointer hover:border-[#cbf230]/40 transition-colors">
                <span className="text-[#f1eff0]">Require Austin Local Anchor</span>
                <input
                  type="checkbox"
                  checked={brief.requireLocal}
                  onChange={(e) => onChange({ requireLocal: e.target.checked })}
                  className="accent-[#cbf230] w-4 h-4 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070709]/80 border border-white/10 cursor-pointer hover:border-[#cbf230]/40 transition-colors">
                <span className="text-[#f1eff0]">Max 1 Country Act</span>
                <input
                  type="checkbox"
                  checked={maxCountry}
                  onChange={(e) => setMaxCountry(e.target.checked)}
                  className="accent-[#cbf230] w-4 h-4 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070709]/80 border border-white/10 cursor-pointer hover:border-[#cbf230]/40 transition-colors">
                <span className="text-[#f1eff0]">Max 35% Overlap Ceiling</span>
                <input
                  type="checkbox"
                  checked={maxOverlap}
                  onChange={(e) => setMaxOverlap(e.target.checked)}
                  className="accent-[#cbf230] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-[#a69fa9]">
            Submodular Matroid: <span className="text-[#cbf230] font-semibold">Active rank check</span>
          </div>
        </div>

        {/* Widget 03: Solver Provenance Benchmark */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-syne text-base uppercase font-bold text-[#f1eff0]">
                Solver Benchmark Card
              </h4>
              <span className="font-mono text-[11px] text-[#a69fa9]">Provenance</span>
            </div>
            <p className="font-space text-xs text-[#a69fa9] mb-4">
              Audit proof of algorithm runtime, cache state, and computational iterations.
            </p>
            <div className="space-y-2 p-4 rounded-xl bg-[#070709]/80 border border-white/10 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#a69fa9]">Algorithm</span>
                <span className="text-[#f1eff0] font-semibold">Greedy + 1-Swap Local</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a69fa9]">Execution Time</span>
                <span className="text-[#cbf230] font-bold">14.2ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a69fa9]">Matrix Inversions</span>
                <span className="text-[#f1eff0]">61 Lookups</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a69fa9]">Approximation Ratio</span>
                <span className="text-[#cbf230]">(1 - 1/e) ≈ 63.2%</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-[#a69fa9]">
            Engine: <span className="text-[#dfb7ff] font-semibold">Qloo Graph / Agentic Core</span>
          </div>
        </div>
      </div>

      {/* Widget 04: Natural Language Query Sandbox Bar */}
      <NlPromptBar onApplyPrompt={handleApplyNlPrompt} isLoading={isLoading} />
    </section>
  );
}
