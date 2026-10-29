"use client";

import React from "react";
import { Network, Cpu, ShieldCheck, ArrowRight } from "lucide-react";

export function QlooShowcase() {
  return (
    <section id="qloo" className="py-16 space-y-10 border-b border-[#f7f9fa]/10">
      {/* Stamped Section Heading (DESIGN.md exact spec) */}
      <div className="overflow-hidden">
        <h2 className="stamp-heading tracking-[0.2em] text-[#f0f0f0] select-none">
          QLOO INTELLIGENCE
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#af50ff]">
            THE CULTURAL TASTE GRAPH ADVANTAGE
          </div>
          <p className="text-[15px] font-light text-[#828384] max-w-2xl leading-relaxed">
            Streaming numbers only track yesterday&apos;s chart velocity. Qloo maps high-dimensional taste embeddings across 575M+ cultural entities to turn lineup booking into mathematical portfolio optimization.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-[6px] border border-[#f7f9fa]/20 bg-[#f7f9fa]/[0.04] text-[11px] font-mono text-[#828384] self-start sm:self-auto">
          <span>ENDPOINT: /v2/insights</span>
        </div>
      </div>

      {/* 3 Discipline Cards in void canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-dope p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#f7f9fa]/[0.06] border border-[#f7f9fa]/20 flex items-center justify-center text-[#f7f9fa]">
            <Network className="w-5 h-5 text-[#af50ff]" />
          </div>
          <h3 className="text-xl font-normal text-[#f7f9fa] tracking-tight">
            575M+ Cultural Taste Graph
          </h3>
          <p className="text-[14px] font-light text-[#828384] leading-relaxed">
            Streaming platforms only measure what is trending now. Qloo connects latent affinities across music, fashion, and lifestyle to identify non-obvious audience intersections.
          </p>
          <div className="pt-2 text-[11px] font-mono uppercase text-[#828384] tracking-wider">
            01 // CROSS-DOMAIN AFFINITY
          </div>
        </div>

        <div className="card-dope p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#f7f9fa]/[0.06] border border-[#f7f9fa]/20 flex items-center justify-center text-[#f7f9fa]">
            <Cpu className="w-5 h-5 text-[#af50ff]" />
          </div>
          <h3 className="text-xl font-normal text-[#f7f9fa] tracking-tight">
            Submodular Diminishing Returns
          </h3>
          <p className="text-[14px] font-light text-[#828384] leading-relaxed">
            When two acts share high <code className="text-[#f7f9fa] font-mono">tasteOverlap</code>, booking both wastes promoter capital on the exact same humans. The Bill penalizes overlap to maximize distinct households.
          </p>
          <div className="pt-2 text-[11px] font-mono uppercase text-[#828384] tracking-wider">
            02 // CANNIBALIZATION REMOVAL
          </div>
        </div>

        <div className="card-dope p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#f7f9fa]/[0.06] border border-[#f7f9fa]/20 flex items-center justify-center text-[#f7f9fa]">
            <ShieldCheck className="w-5 h-5 text-[#af50ff]" />
          </div>
          <h3 className="text-xl font-normal text-[#f7f9fa] tracking-tight">
            Pure Grounded Determinism
          </h3>
          <p className="text-[14px] font-light text-[#828384] leading-relaxed">
            Zero LLM hallucination. Every figure in the receipt is computed from Qloo cosine vectors and mathematical knapsack models. Same brief produces byte-identical results.
          </p>
          <div className="pt-2 text-[11px] font-mono uppercase text-[#828384] tracking-wider">
            03 // ZERO HALLUCINATION
          </div>
        </div>
      </div>

      {/* The Single Violet Bloom Card on the page (DESIGN.md exact spec) */}
      <div className="card-violet-bloom p-8 sm:p-12 text-[#090909] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#090909]/80 font-bold">
              PORTFOLIO PROOF // THE VIOLET BEACON
            </div>
            <h3 className="text-2xl sm:text-4xl font-normal text-[#090909] tracking-tight leading-tight">
              Naive Booking burns 45% of capital on identical fans.
            </h3>
            <p className="text-[15px] font-normal text-[#090909]/90 max-w-xl leading-relaxed">
              Traditional promoters book chart-toppers whose fans already overlap 70%+. The Bill replaces guesswork with Qloo taste vectors — delivering <strong className="font-bold">+45.6% more unique festival attendees</strong> at constant spend.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:items-end justify-center">
            <div className="p-6 rounded-[12px] bg-[#090909] text-[#f7f9fa] space-y-1 text-center w-full max-w-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#828384] block">
                MEASURED DEMAND UPLIFT
              </span>
              <span className="text-4xl font-mono font-bold text-[#af50ff] block">
                +45.6%
              </span>
              <span className="text-[11px] text-[#828384] block font-mono">
                MEDIAN ACROSS BENCHMARKS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
