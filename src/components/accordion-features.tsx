"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

export function AccordionFeatures() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const features = [
    {
      num: "01",
      title: "Submodular Marginal Reach Optimization",
      desc: "Raw stream counts trick promoters into booking duplicative acts. Crowdfolio penalizes overlapping listener pools so every dollar spent expands distinct ticket-buying households.",
    },
    {
      num: "02",
      title: "Eliminating Duplicate Overlap (-10.0 pts)",
      desc: "By measuring pairwise cosine similarity in high-dimensional taste space, our knapsack solver actively cuts redundant lineup tasteOverlap by 10.0 percentage points compared to naive bookings.",
    },
    {
      num: "03",
      title: "575M+ Cultural Taste Graph Embeddings",
      desc: "Grounded in Qloo's deep taste intelligence across music, fashion, and cultural preferences, identifying non-obvious affinities that conventional chart analytics completely miss.",
    },
    {
      num: "04",
      title: "Pure Deterministic Knapsack Curation",
      desc: "Zero LLM hallucination. Every output is byte-identical and mathematically computed. The solver respects hard budget constraints, local opener guarantees, and maximum genre quotas.",
    },
    {
      num: "05",
      title: "Chronological Run-of-Show Timetable Scheduling",
      desc: "Automatically distributes curated acts across Main Stage and Stage 2, calculating realistic set timings from early afternoon openers through late-night headliners.",
    },
    {
      num: "06",
      title: "Overridable Heuristic Talent Fee Modeling",
      desc: "Every fee renders with an est. marker scaled to budget tier. Promoters can click any slot to override estimates with real negotiated booking quotes and re-solve instantly.",
    },
  ];

  return (
    <section id="features" className="py-16 space-y-10 border-b border-[#f7f9fa]/10">
      {/* Stamped Section Heading (DESIGN.md exact spec) */}
      <div className="overflow-hidden">
        <h2 className="stamp-heading tracking-[0.2em] text-[#f0f0f0] select-none">
          PORTFOLIO ARCHITECTURE
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Context in Whyte Inktrap */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-2xl sm:text-3xl font-normal text-[#f7f9fa] tracking-tight">
            Six Mathematical Disciplines
          </h3>
          <p className="text-[15px] font-light text-[#828384] leading-relaxed">
            One pure deterministic engine, zero hallucinated numbers. Built for festival directors who demand maximum distinct audience reach per talent dollar.
          </p>
        </div>

        {/* Right Column: Feature Rows (DESIGN.md Feature Row Card) */}
        <div className="lg:col-span-8 divide-y divide-[#f7f9fa]/10">
          {features.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={item.num} className="py-5 group">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-6 transition"
                >
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span className="font-mono text-sm sm:text-base text-[#828384] group-hover:text-[#af50ff] transition">
                      {item.num}
                    </span>
                    <span className="text-base sm:text-lg font-normal text-[#f7f9fa] tracking-tight">
                      {item.title}
                    </span>
                  </div>

                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-lg border border-[#f7f9fa]/20 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-45 border-[#af50ff] text-[#af50ff]" : "text-[#828384] group-hover:text-white"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="pl-8 sm:pl-12 pt-3 pb-2 text-[14px] text-[#828384] font-light leading-relaxed max-w-2xl">
                    {item.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
