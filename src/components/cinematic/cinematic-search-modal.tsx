"use client";

import React, { useState } from "react";
import { Search, X, Film, Sparkles, Music } from "lucide-react";

interface CinematicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export function CinematicSearchModal({
  isOpen,
  onClose,
  onSelectOption,
}: CinematicSearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const quickPills = [
    { label: "Step Through (Feature)", type: "movie" },
    { label: "Austin City Limits Portfolio", type: "lineup" },
    { label: "Tokyo Hyperlocal Echoes", type: "lineup" },
    { label: "Submodular Knapsack Optimizer", type: "tech" },
    { label: "Indie Rock & Taste Graph", type: "genre" },
  ];

  const filteredPills = query.trim()
    ? quickPills.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : quickPills;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-gray-900/95 border border-gray-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2.5 text-white">
            <Search size={18} className="text-gray-400" />
            <h3 className="text-base font-medium">Search Library & Portfolios</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, festival lineups, genres, or artists..."
            className="w-full rounded-xl bg-black/60 border border-gray-700/80 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
            Quick Suggestions
          </span>
          <div className="flex flex-wrap gap-2">
            {filteredPills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  onSelectOption(pill.label);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-full liquid-glass px-3 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {pill.type === "movie" ? (
                  <Film size={12} className="text-gray-400" />
                ) : pill.type === "lineup" ? (
                  <Music size={12} className="text-gray-400" />
                ) : (
                  <Sparkles size={12} className="text-gray-400" />
                )}
                <span>{pill.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

