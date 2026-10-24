"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { parseConstraintEdit, ConstraintPatch } from "@/lib/agent/parse";

interface AgentPanelProps {
  onApplyPatch: (patch: ConstraintPatch) => void;
  isLoading: boolean;
}

export function AgentPanel({ onApplyPatch, isLoading }: AgentPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const quickPrompts = [
    "Cut budget to $180k",
    "Require Austin local opener",
    "Reduce lineup to 6 acts",
    "Increase budget to $350k with 10 acts",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const patch = await parseConstraintEdit(prompt);
    onApplyPatch(patch);
    setLastAction(`Applied edit: "${prompt}"`);
    setPrompt("");
  };

  const handleQuickClick = async (text: string) => {
    if (isLoading) return;
    const patch = await parseConstraintEdit(text);
    onApplyPatch(patch);
    setLastAction(`Applied edit: "${text}"`);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span>Conversational Constraint Editor</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">
          Zero Hallucinated Numbers &bull; Grounded in Solver
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          suppressHydrationWarning
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Cut budget to $180k and add an Austin local act'..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 pr-10 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition"
        />
        <button
          type="submit"
          suppressHydrationWarning
          disabled={!prompt.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-violet-400 hover:text-white hover:bg-violet-600/30 transition disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-violet-400" /> Suggestions:
        </span>
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            suppressHydrationWarning
            onClick={() => handleQuickClick(q)}
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-violet-500/40 hover:text-zinc-200 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {lastAction && (
        <div className="text-[11px] text-emerald-400 font-medium pt-1">
          &bull; {lastAction}
        </div>
      )}
    </div>
  );
}
