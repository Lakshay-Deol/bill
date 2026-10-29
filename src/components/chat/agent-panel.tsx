"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldCheck, MessageSquare, Sparkles } from "lucide-react";
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
    "Require local opener",
    "Reduce lineup to 6 acts",
    "Increase budget to $350k with 10 acts",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const patch = await parseConstraintEdit(prompt);
    onApplyPatch(patch);
    setLastAction(`Applied directive: "${prompt}"`);
    setPrompt("");
  };

  const handleQuickClick = async (text: string) => {
    if (isLoading) return;
    const patch = await parseConstraintEdit(text);
    onApplyPatch(patch);
    setLastAction(`Applied directive: "${text}"`);
  };

  return (
    <div className="card-dope p-6 sm:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f7f9fa]/10 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#af50ff]" />
          <span className="text-sm font-syne font-bold text-[#f7f9fa]">
            Constraint Assistant
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          suppressHydrationWarning
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type constraint: e.g. 'Cut budget to $180k and add an Austin local act'..."
          className="w-full rounded-[6px] bg-[#f7f9fa]/[0.05] border border-[#f7f9fa]/20 px-4 py-3 pr-14 text-sm text-[#f7f9fa] placeholder:text-[#828384] focus:outline-none focus:border-[#af50ff] transition font-mono"
        />
        <button
          type="submit"
          suppressHydrationWarning
          disabled={!prompt.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-[6px] bg-[#af50ff] text-[#090909] font-mono font-medium text-xs flex items-center gap-1 hover:brightness-110 transition disabled:opacity-20"
        >
          <span>SEND</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#828384] font-mono flex items-center gap-1 text-[11px] uppercase">
          <Sparkles className="w-3 h-3 text-[#af50ff]" /> DIRECTIVES:
        </span>
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            suppressHydrationWarning
            onClick={() => handleQuickClick(q)}
            className="rounded-[6px] px-3 py-1 bg-[#f7f9fa]/[0.04] border border-[#f7f9fa]/12 text-[#828384] font-mono text-[11px] hover:border-[#af50ff]/50 hover:text-[#f7f9fa] transition"
          >
            {q}
          </button>
        ))}
      </div>

      {lastAction && (
        <div className="text-xs font-mono text-[#af50ff] pt-2 border-t border-[#f7f9fa]/10">
          &bull; {lastAction} (deterministic re-solve complete)
        </div>
      )}
    </div>
  );
}
