"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { LandingHero } from "@/components/landing-hero";
import { MarqueeTicker } from "@/components/marquee-ticker";
import { AccordionFeatures } from "@/components/accordion-features";
import { ShowcaseGrid } from "@/components/showcase-grid";
import { QlooShowcase } from "@/components/qloo-showcase";
import { BriefControls, BriefState } from "@/components/brief-controls";
import { Poster } from "@/components/poster";
import { Comparison } from "@/components/comparison";
import { Drawer } from "@/components/drawer";
import { AgentPanel } from "@/components/chat/agent-panel";
import { MatrixModal } from "@/components/matrix-modal";
import { TimetableModal } from "@/components/timetable-modal";
import { PosterModal } from "@/components/poster-modal";
import { CoordinateFooter } from "@/components/coordinate-footer";
import { LineupReceipt, BookedSlot } from "@/lib/solver";
import { AlertCircle, CheckCircle2, Activity } from "lucide-react";

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
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  // Modals
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [isTimetableOpen, setIsTimetableOpen] = useState<boolean>(false);
  const [isPosterOpen, setIsPosterOpen] = useState<boolean>(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const qlooRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const executeSolve = useCallback(
    async (targetBrief?: BriefState, targetOverrides?: Record<string, number>) => {
      const activeBrief = targetBrief ?? brief;
      const activeOverrides = targetOverrides ?? feeOverrides;
      setIsLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        const res = await fetch("/api/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...activeBrief, feeOverrides: activeOverrides }),
        });
        setApiLatency(Math.round(performance.now() - startTime));

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message ?? `Solver API returned status ${res.status}`);
        }
        const data: LineupReceipt = await res.json();
        setReceipt(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to solve lineup");
      } finally {
        setIsLoading(false);
      }
    },
    [brief, feeOverrides]
  );

  useEffect(() => {
    executeSolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (p: BriefState) => { setBrief(p); executeSolve(p); };
  const handleApplyPatch = (p: Partial<BriefState>) => {
    const updated = { ...brief, ...p };
    setBrief(updated);
    executeSolve(updated);
  };
  const handleOverrideFee = (actId: string, fee: number) => {
    const updated = { ...feeOverrides, [actId]: fee };
    setFeeOverrides(updated);
    executeSolve(brief, updated);
  };

  const scrollToTerminal = () => terminalRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToQloo = () => qlooRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#090909] text-[#f7f9fa] flex flex-col font-sans selection:bg-[#af50ff]/30" suppressHydrationWarning>
      <Header
        onOpenMatrix={() => setIsMatrixOpen(true)}
        onOpenTimetable={() => setIsTimetableOpen(true)}
        onOpenPoster={() => setIsPosterOpen(true)}
        onScrollToTerminal={scrollToTerminal}
        onScrollToQloo={scrollToQloo}
        onScrollToFeatures={scrollToFeatures}
        hasReceipt={!!receipt}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
        {/* Hero Section (Boarding Pass & Editorial Typography) */}
        <LandingHero
          onLaunchTerminal={scrollToTerminal}
          onExploreQloo={scrollToQloo}
        />

        {/* Marquee Ticker */}
        <MarqueeTicker />

        {/* Feature Disciplines Accordion */}
        <div ref={featuresRef}>
          <AccordionFeatures />
        </div>

        {/* Showcase Grid of Benchmark Routes */}
        <ShowcaseGrid
          onSelectPreset={handleSelectPreset}
          onScrollToTerminal={scrollToTerminal}
        />

        {/* Qloo Intelligence Showcase */}
        <div ref={qlooRef}>
          <QlooShowcase />
        </div>

        {/* Live Solver Terminal Anchor */}
        <div ref={terminalRef} className="pt-6 space-y-8">
          <div className="overflow-hidden">
            <h2 className="stamp-heading tracking-[0.2em] text-[#f0f0f0] select-none">
              TERMINAL SOLVER
            </h2>
          </div>

          {/* Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-4 rounded-[8px] bg-[#090909] border border-[#f7f9fa]/12 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#af50ff] animate-pulse" />
              <span className="text-[#f7f9fa] uppercase">PORTFOLIO SOLVER ACTIVE</span>
              <span className="text-[#474747]">&bull;</span>
              <span className="text-[#828384]">ENDPOINT: /api/solve</span>
            </div>
            <div className="flex items-center gap-4 text-[#828384]">
              {apiLatency !== null && (
                <span className="text-[#af50ff] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  STATUS: 200 OK ({apiLatency}ms)
                </span>
              )}
              <span className="hidden sm:inline">DATA: LIVE QLOO EMBEDDINGS</span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-[8px] bg-[#090909] border border-red-500/50 text-xs text-red-300 font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <BriefControls
            brief={brief}
            onChange={(u) => setBrief((prev) => ({ ...prev, ...u }))}
            onSelectPreset={handleSelectPreset}
            onSolve={() => executeSolve()}
            isLoading={isLoading}
          />

          <AgentPanel onApplyPatch={handleApplyPatch} isLoading={isLoading} />
        </div>

        {isLoading && !receipt && (
          <div className="card-dope p-12 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#af50ff]/10 border border-[#af50ff]/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#af50ff] animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-normal text-[#f7f9fa]">
                Querying Qloo Cultural Taste Graph...
              </h3>
              <p className="text-xs text-[#828384] max-w-md mx-auto font-mono">
                Computing pairwise cosine tasteOverlap and solving submodular knapsack.
              </p>
            </div>
          </div>
        )}

        {receipt && (
          <div className="space-y-12">
            <Comparison receipt={receipt} />
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono text-[#828384] uppercase tracking-wider">
                  FESTIVAL LINEUP POSTER & STAGE BREAKDOWN
                </h3>
                <span className="text-xs text-[#828384] font-mono">
                  Click slot to inspect Qloo tasteOverlap
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

      {/* Coordinate Stamp Footer (DESIGN.md exact spec) */}
      <CoordinateFooter market={brief.market} />

      {/* Modals */}
      {receipt && (
        <>
          <MatrixModal
            receipt={receipt}
            isOpen={isMatrixOpen}
            onClose={() => setIsMatrixOpen(false)}
          />
          <TimetableModal
            receipt={receipt}
            isOpen={isTimetableOpen}
            onClose={() => setIsTimetableOpen(false)}
          />
          <PosterModal
            receipt={receipt}
            market={brief.market}
            isOpen={isPosterOpen}
            onClose={() => setIsPosterOpen(false)}
          />
        </>
      )}

      {/* Attribution Drawer */}
      <Drawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onOverrideFee={handleOverrideFee}
      />
    </div>
  );
}
