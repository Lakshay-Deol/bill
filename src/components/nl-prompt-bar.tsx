"use client";

import React, { useState } from "react";
import { Terminal, Play } from "lucide-react";

interface NlPromptBarProps {
  onApplyPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export function NlPromptBar({ onApplyPrompt, isLoading }: NlPromptBarProps) {
  const [nlQuery, setNlQuery] = useState("");

  const handleApply = () => {
    if (nlQuery.trim()) {
      onApplyPrompt(nlQuery);
    }
  };

  const samplePrompts = [
    "Cut budget to $180k",
    "Require Austin local anchor",
    "Chicago 8k Acts $350k",
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#131316]/80 border border-white/10 space-y-4">
      {/* Header without eyebrow */}
      <div>
        <h4 className="font-syne text-base uppercase font-bold text-[#f1eff0]">
          Interactive Constraint Prompting
        </h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full font-mono">
          <Terminal className="w-4 h-4 text-[#dfb7ff] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="nl-query-input"
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="Prompt solver... e.g. Cut budget to $180k or require Austin local opener"
            className="w-full bg-[#070709]/80 border border-white/10 pl-11 pr-4 py-2.5 rounded-xl text-[#f1eff0] text-xs placeholder:text-[#a69fa9]/40 focus:outline-none focus:border-[#cbf230] transition-all"
          />
        </div>
        <button
          id="nl-query-apply"
          type="button"
          onClick={handleApply}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#cbf230] text-[#09090b] rounded-xl font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#d8ff3e] transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-[#09090b]" />
          <span>{isLoading ? "SOLVING..." : "APPLY PROMPT"}</span>
        </button>
      </div>

      {/* Quick Test Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 font-mono text-xs">
        <span className="text-[10px] text-[#a69fa9] uppercase mr-1">TEST PROMPTS:</span>
        {samplePrompts.map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => {
              setNlQuery(promptText);
              onApplyPrompt(promptText);
            }}
            className="px-3 py-1 rounded-full bg-[#17171b] hover:bg-[#1e1e24] border border-white/10 text-[#a69fa9] hover:text-[#f1eff0] transition-colors cursor-pointer text-[11px]"
          >
            &ldquo;{promptText}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
