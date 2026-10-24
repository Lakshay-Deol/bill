"use client";

import React from "react";
import { Sliders, MapPin, Users, DollarSign, Music, RefreshCw } from "lucide-react";

export interface BriefState {
  market: string;
  budget: number;
  capacity: number;
  actCount: number;
  requireLocal: boolean;
  seeds: string[];
}

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
  onSelectPreset,
  onSolve,
  isLoading,
}: BriefControlsProps) {
  const presets = [
    {
      name: "Austin Indie 2026",
      market: "Austin",
      budget: 250000,
      capacity: 5000,
      actCount: 8,
      requireLocal: true,
      seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
    },
    {
      name: "Brooklyn Warehouse",
      market: "New York",
      budget: 180000,
      capacity: 3500,
      actCount: 6,
      requireLocal: false,
      seeds: ["Big Thief", "Adrianne Lenker", "Faye Webster"],
    },
    {
      name: "Chicago Lakefront",
      market: "Chicago",
      budget: 350000,
      capacity: 8000,
      actCount: 10,
      requireLocal: true,
      seeds: ["Soccer Mommy", "Indigo De Souza", "The Beths"],
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800/80 gap-3">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
          <Sliders className="w-4 h-4 text-violet-400" />
          <span>Promoter Brief Parameters</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (onSelectPreset) {
                  onSelectPreset(p);
                } else {
                  onChange(p);
                }
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:border-violet-500/50 hover:text-white transition disabled:opacity-50"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market */}
        <div>
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Market
          </label>
          <input
            type="text"
            value={brief.market}
            onChange={(e) => onChange({ market: e.target.value })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition"
            placeholder="e.g. Austin, TX"
          />
        </div>

        {/* Talent Budget */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Talent Budget
            </label>
            <span className="text-xs font-bold text-emerald-400">
              ${brief.budget.toLocaleString("en-US")}
            </span>
          </div>
          <input
            type="range"
            min={50000}
            max={1000000}
            step={10000}
            value={brief.budget}
            onChange={(e) => onChange({ budget: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Capacity */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Cap Size
            </label>
            <span className="text-xs font-bold text-indigo-400">
              {brief.capacity.toLocaleString("en-US")} fans
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={25000}
            step={500}
            value={brief.capacity}
            onChange={(e) => onChange({ capacity: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Acts Count */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-violet-400" /> Total Acts
            </label>
            <span className="text-xs font-bold text-violet-400">{brief.actCount} acts</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[4, 6, 8, 10, 12].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onChange({ actCount: cnt })}
                className={`flex-1 py-1 text-xs rounded-lg border font-medium transition ${
                  brief.actCount === cnt
                    ? "border-violet-500 bg-violet-600/30 text-white"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={brief.requireLocal}
            onChange={(e) => onChange({ requireLocal: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-500 w-4 h-4"
          />
          <span>Require at least one market-local act on the bill</span>
        </label>

        <button
          type="button"
          onClick={onSolve}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Optimizing Portfolio..." : "Solve Lineup"}</span>
        </button>
      </div>
    </div>
  );
}
