"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { BriefControls, BriefState } from "@/components/brief-controls";
import { Poster } from "@/components/poster";
import { Comparison } from "@/components/comparison";
import { Drawer } from "@/components/drawer";
import { LineupReceipt, BookedSlot } from "@/lib/solver";
import { AlertCircle, Sparkles } from "lucide-react";

export default function Home() {
  const [brief, setBrief] = useState<BriefState>({
    market: "Austin",
    budget: 250000,
    capacity: 5000,
    actCount: 8,
    requireLocal: true,
    seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
  });

  const [feeOverrides, setFeeOverrides] = useState<Record<string, number>>({});
  const [receipt, setReceipt] = useState<LineupReceipt | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeSolve = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brief,
          feeOverrides,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Solver API returned status ${res.status}`);
      }

      const data: LineupReceipt = await res.json();
      setReceipt(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to solve lineup");
    } finally {
      setIsLoading(false);
    }
  }, [brief, feeOverrides]);

  // Initial solve on mount
  useEffect(() => {
    executeSolve();
  }, [executeSolve]);

  const handleOverrideFee = (actId: string, fee: number) => {
    setFeeOverrides((prev) => ({ ...prev, [actId]: fee }));
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-xs text-violet-300 font-medium mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Lineups Are Portfolios</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              The Bill
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-1 max-w-2xl">
              Maximize distinct demand reached per talent dollar subject to budget constraints, grounded in Qloo&apos;s taste graph.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Powered by Qloo Insights API</span>
            <span>&bull;</span>
            <span>Zero Hallucinated Numerals</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* S1: Promoter Brief Parameters */}
        <section>
          <BriefControls
            brief={brief}
            onChange={(updated) => setBrief((prev) => ({ ...prev, ...updated }))}
            onSolve={executeSolve}
            isLoading={isLoading}
          />
        </section>

        {/* S2 & S3: Poster & Value Comparison */}
        {receipt && (
          <div className="space-y-8">
            {/* The Comparison KPI & Delta */}
            <section>
              <Comparison receipt={receipt} />
            </section>

            {/* The Lineup Poster */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-zinc-200 tracking-wide uppercase">
                  Festival Lineup Poster
                </h2>
                <span className="text-xs text-zinc-500">
                  Click any slot to inspect taste overlap attribution
                </span>
              </div>
              <Poster
                stages={receipt.stages}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
                selectedSlotId={selectedSlot?.id}
                onOverrideFee={handleOverrideFee}
              />
            </section>
          </div>
        )}
      </main>

      {/* S4: Attribution Drawer */}
      <Drawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onOverrideFee={handleOverrideFee}
      />
    </div>
  );
}
