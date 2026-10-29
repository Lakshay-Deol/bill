"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { LandingHero } from "@/components/landing-hero";
import { FluidShader } from "@/components/fluid-shader";
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
    <div className="min-h-screen bg-[#09090b] text-[#f1eff0] flex flex-col font-sans selection:bg-[#cbf230] selection:text-[#09090b] relative" suppressHydrationWarning>
      {/* Full Page Ambient WebGL Fluid Shader with reduced motion respect */}
      <FluidShader />

      {/* Centered Floating Pill Navbar */}
      <Header
        onOpenMatrix={() => setIsMatrixOpen(true)}
        onOpenTimetable={() => setIsTimetableOpen(true)}
        onOpenPoster={() => setIsPosterOpen(true)}
        onScrollToTerminal={scrollToTerminal}
        onScrollToQloo={scrollToQloo}
        onScrollToFeatures={scrollToFeatures}
        hasReceipt={!!receipt}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-32 space-y-16">
        {/* Hero Section */}
        <LandingHero
          onLaunchTerminal={scrollToTerminal}
          onExploreQloo={scrollToQloo}
          onSelectPreset={handleSelectPreset}
          receipt={receipt}
          activeBrief={brief}
        />

        {/* Marquee Ticker */}
        <MarqueeTicker />

        {/* Qloo Intelligence Architecture Suite */}
        <div ref={qlooRef}>
          <QlooShowcase />
        </div>

        {/* Feature Disciplines Accordion */}
        <div ref={featuresRef}>
          <AccordionFeatures />
        </div>

        {/* Showcase Grid of Benchmark Routes */}
        <ShowcaseGrid
          onSelectPreset={handleSelectPreset}
          onScrollToTerminal={scrollToTerminal}
        />

        {/* Live Solver Terminal Anchor */}
        <div ref={terminalRef} className="pt-6 space-y-8">
          <div className="overflow-hidden">
            <h2 className="stamp-heading tracking-[0.2em] text-[#f0f0f0] select-none">
              TERMINAL SOLVER
            </h2>
          </div>

          {error && (
            <div className="p-4 rounded-[8px] bg-[#09090b] border border-red-500/50 text-xs text-red-300 font-mono flex items-center gap-2.5">
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
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#cbf230]/10 border border-[#cbf230]/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#cbf230] animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-normal text-[#f1eff0]">
                Querying Qloo Cultural Taste Graph...
              </h3>
              <p className="text-xs text-[#a69fa9] max-w-md mx-auto font-mono">
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
                <h3 className="text-sm font-mono text-[#a69fa9] uppercase tracking-wider">
                  THE CURATED BILL & STAGE BREAKDOWN
                </h3>
                <span className="text-xs text-[#a69fa9] font-mono">
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

      {/* Floating Dock Benchmark Bar */}
      <aside className="fixed bottom-4 left-4 right-4 z-40 max-w-[1440px] mx-auto pointer-events-none">
        <div className="bg-[#070709]/85 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5 shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[#a69fa9] font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#cbf230] shadow-[0_0_8px_#cbf230]" />
            <span>
              API ENDPOINT: <code className="text-[#f1eff0] bg-white/5 px-1.5 py-0.5 rounded">POST /api/solve</code>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {apiLatency !== null && (
              <span>
                Execution: <strong className="text-[#cbf230]">{apiLatency}ms</strong>
              </span>
            )}
            <span>Seed: <code className="text-[#f1eff0]">0x8F9C4A2</code></span>
            <span className="inline-flex items-center gap-1 text-[#cbf230] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> QLOO READY
            </span>
          </div>
        </div>
      </aside>

      <CoordinateFooter market={brief.market} />

      {receipt && (
        <>
          <MatrixModal receipt={receipt} isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />
          <TimetableModal receipt={receipt} isOpen={isTimetableOpen} onClose={() => setIsTimetableOpen(false)} />
          <PosterModal receipt={receipt} market={brief.market} isOpen={isPosterOpen} onClose={() => setIsPosterOpen(false)} />
        </>
      )}

      <Drawer slot={selectedSlot} onClose={() => setSelectedSlot(null)} onOverrideFee={handleOverrideFee} />
    </div>
  );
}
