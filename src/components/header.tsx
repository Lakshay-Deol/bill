import React from "react";
import { Sparkles, BarChart3, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-emerald-400 text-sm">
                B
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">The Bill</span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
                Taste Graph Optimizer
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Budget-constrained festival lineup portfolio grounded in Qloo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Solver</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Max-Coverage Knapsack</span>
          </div>
        </div>
      </div>
    </header>
  );
}
