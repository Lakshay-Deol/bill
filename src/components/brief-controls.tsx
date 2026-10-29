"use client";

import React from "react";
import { Sliders, MapPin, DollarSign, Users, RefreshCw } from "lucide-react";

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
      name: "Austin Indie ($250k)",
      market: "Austin",
      budget: 250000,
      capacity: 5000,
      actCount: 8,
      requireLocal: true,
      seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
    },
    {
      name: "Tokyo Shibuya ($320k)",
      market: "Tokyo",
      budget: 320000,
      capacity: 6500,
      actCount: 8,
      requireLocal: true,
      seeds: ["Massive Attack", "Portishead", "Cornelius"],
    },
    {
      name: "Brooklyn Warehouse ($180k)",
      market: "New York",
      budget: 180000,
      capacity: 3500,
      actCount: 6,
      requireLocal: false,
      seeds: ["Big Thief", "Adrianne Lenker", "Faye Webster"],
    },
    {
      name: "Chicago Lakefront ($350k)",
      market: "Chicago",
      budget: 350000,
      capacity: 8000,
      actCount: 10,
      requireLocal: true,
      seeds: ["Soccer Mommy", "Indigo De Souza", "The Beths"],
    },
  ];

  return (
    <div className="card-dope p-6 sm:p-10 space-y-8">
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#f7f9fa]/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f7f9fa]/[0.06] border border-[#f7f9fa]/20 flex items-center justify-center text-[#af50ff]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#af50ff]">
              FLIGHT PARAMETERS
            </div>
            <h3 className="text-lg font-normal text-[#f7f9fa] tracking-tight">
              Promoter Brief & Constraints
            </h3>
          </div>
        </div>

        {/* Presets in Ghost Pill style */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => {
            const isSelected = brief.market.toLowerCase() === p.market.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                suppressHydrationWarning
                disabled={isLoading}
                onClick={() => {
                  if (onSelectPreset) {
                    onSelectPreset(p);
                  } else {
                    onChange(p);
                  }
                }}
                className={`text-[12px] font-mono px-3.5 py-1.5 rounded-full transition border ${
                  isSelected
                    ? "bg-[#af50ff] text-[#090909] font-medium border-[#af50ff]"
                    : "bg-[#090909] text-[#828384] border-[#f7f9fa]/15 hover:border-[#f7f9fa]/40 hover:text-[#f7f9fa]"
                } disabled:opacity-40`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs Grid with 6px control radius */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Target Market */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#828384] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#af50ff]" /> Target Market
          </label>
          <input
            type="text"
            suppressHydrationWarning
            value={brief.market}
            onChange={(e) => onChange({ market: e.target.value })}
            className="w-full rounded-[6px] bg-[#f7f9fa]/[0.05] border border-[#f7f9fa]/20 px-3.5 py-2.5 text-sm text-[#f7f9fa] focus:outline-none focus:border-[#af50ff] transition font-mono"
            placeholder="e.g. Austin"
          />
        </div>

        {/* Talent Budget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label className="text-[#828384] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#af50ff]" /> Talent Budget
            </label>
            <span className="font-bold text-[#f7f9fa]">
              ${brief.budget.toLocaleString("en-US")}
            </span>
          </div>
          <input
            type="range"
            suppressHydrationWarning
            min={50000}
            max={1000000}
            step={10000}
            value={brief.budget}
            onChange={(e) => onChange({ budget: Number(e.target.value) })}
            className="w-full accent-[#af50ff] bg-[#f7f9fa]/10 h-1.5 rounded-[6px] cursor-pointer"
          />
        </div>

        {/* Venue Capacity */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label className="text-[#828384] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#828384]" /> Capacity
            </label>
            <span className="font-bold text-[#f7f9fa]">
              {brief.capacity.toLocaleString("en-US")}
            </span>
          </div>
          <input
            type="range"
            suppressHydrationWarning
            min={1000}
            max={50000}
            step={500}
            value={brief.capacity}
            onChange={(e) => onChange({ capacity: Number(e.target.value) })}
            className="w-full accent-[#af50ff] bg-[#f7f9fa]/10 h-1.5 rounded-[6px] cursor-pointer"
          />
        </div>

        {/* Lineup Size */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <label className="text-[#828384] uppercase tracking-wider">
              Lineup Size
            </label>
            <span className="font-bold text-[#f7f9fa]">
              {brief.actCount} Acts
            </span>
          </div>
          <input
            type="range"
            suppressHydrationWarning
            min={4}
            max={16}
            step={1}
            value={brief.actCount}
            onChange={(e) => onChange({ actCount: Number(e.target.value) })}
            className="w-full accent-[#af50ff] bg-[#f7f9fa]/10 h-1.5 rounded-[6px] cursor-pointer"
          />
        </div>
      </div>

      {/* Bottom Seed Entities & Solve Dispatch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 border-t border-[#f7f9fa]/10 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[#828384] uppercase tracking-wider">
            SEEDS:
          </span>
          {brief.seeds.map((seed, idx) => (
            <span
              key={idx}
              className="text-xs px-3 py-1 rounded-[6px] bg-[#f7f9fa]/[0.05] border border-[#f7f9fa]/15 text-[#f7f9fa] font-mono"
            >
              {seed}
            </span>
          ))}

          {/* Local opener toggle */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onChange({ requireLocal: !brief.requireLocal })}
            className={`text-xs px-3 py-1 rounded-[6px] border transition font-mono ml-2 ${
              brief.requireLocal
                ? "bg-[#af50ff]/10 text-[#af50ff] border-[#af50ff]/40"
                : "bg-transparent text-[#828384] border-[#f7f9fa]/15"
            }`}
          >
            {brief.requireLocal ? "LOCAL OPENER: REQUIRED" : "LOCAL OPENER: OPTIONAL"}
          </button>
        </div>

        {/* Re-solve CTA Button (Signal Violet primary action) */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={onSolve}
          disabled={isLoading}
          className="btn-signal-violet text-xs py-2.5 px-6 self-end md:self-auto uppercase tracking-wider font-mono font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "SOLVING PORTFOLIO..." : "SOLVE OPTIMAL LINEUP"}</span>
        </button>
      </div>
    </div>
  );
}
