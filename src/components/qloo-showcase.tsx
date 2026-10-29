"use client";

import React from "react";
import { Terminal, ShieldCheck, Database, MapPin, DollarSign, Receipt, CheckCircle2 } from "lucide-react";

export function QlooShowcase() {
  return (
    <section id="qloo" className="w-full bg-[#070709]/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden ring-1 ring-white/5 space-y-8">
      {/* Background radial tint */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#dfb7ff]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#cbf230] uppercase tracking-widest mb-1.5">
            <Database className="w-3.5 h-3.5 text-[#cbf230]" />
            ENTERPRISE TASTE INTELLIGENCE
          </div>
          <h2 className="font-syne text-3xl sm:text-4xl uppercase tracking-tight text-[#f1eff0]">
            Why Qloo is Load-Bearing
          </h2>
          <p className="font-space text-sm sm:text-base text-[#a69fa9] mt-1 max-w-2xl leading-relaxed">
            Without Qloo&apos;s high-dimensional cultural embeddings, promoters optimize solely for isolated vanity metrics (Spotify monthly listeners). The Bill computes cross-genre covariance to maximize true distinct attendance.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#131316] border border-white/10 text-xs font-mono text-[#a69fa9] self-start md:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#cbf230] animate-pulse" />
          <span>LIVE TASTE GRAPH CONNECTED</span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Pillar 1 */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 backdrop-blur-sm border border-white/10 flex flex-col justify-between hover:border-[#cbf230]/50 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-[#cbf230]/10 text-[#cbf230] flex items-center justify-center font-mono font-bold text-sm">
                01
              </span>
              <span className="font-mono text-[11px] text-[#a69fa9]">/v2/insights</span>
            </div>
            <h3 className="font-space text-base uppercase text-[#f1eff0] font-bold group-hover:text-[#cbf230] transition-colors mb-2">
              250M-Entity Affinity Graph
            </h3>
            <p className="font-space text-xs text-[#a69fa9] leading-relaxed">
              Calculates cosine vector distances across 50-neighbor affinity projections. Eliminates acts whose tasteOverlap exceeds 35%.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 font-mono text-[11px] text-[#cbf230] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> 512-dim Taste Vector Space
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 backdrop-blur-sm border border-white/10 flex flex-col justify-between hover:border-[#dfb7ff]/50 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-[#dfb7ff]/10 text-[#dfb7ff] flex items-center justify-center font-mono font-bold text-sm">
                02
              </span>
              <span className="font-mono text-[11px] text-[#a69fa9]">location.query</span>
            </div>
            <h3 className="font-space text-base uppercase text-[#f1eff0] font-bold group-hover:text-[#dfb7ff] transition-colors mb-2">
              Hyperlocal Market Geo-Weights
            </h3>
            <p className="font-space text-xs text-[#a69fa9] leading-relaxed">
              Injects regional draw indices (Austin Metro core vs national stream counts), giving priority to regional anchors like Black Pumas (0.94).
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 font-mono text-[11px] text-[#dfb7ff] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Austin MSA DMA Calibrated
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 backdrop-blur-sm border border-white/10 flex flex-col justify-between hover:border-[#ffb4a3]/50 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-[#ffb4a3]/10 text-[#ffb4a3] flex items-center justify-center font-mono font-bold text-sm">
                03
              </span>
              <span className="font-mono text-[11px] text-[#a69fa9]">cost.proxy_model</span>
            </div>
            <h3 className="font-space text-base uppercase text-[#f1eff0] font-bold group-hover:text-[#ffb4a3] transition-colors mb-2">
              Popularity Talent Cost Proxy
            </h3>
            <p className="font-space text-xs text-[#a69fa9] leading-relaxed">
              Calibrates live booking fees via Qloo popularity deciles. Yields exact cost-per-unique-reach (CPUR) rather than crude headcounts.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 font-mono text-[11px] text-[#ffb4a3] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Normalized Fee Elasticity
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 rounded-2xl bg-[#131316]/80 backdrop-blur-sm border border-white/10 flex flex-col justify-between hover:border-[#cbf230]/50 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-9 h-9 rounded-xl bg-[#cbf230]/10 text-[#cbf230] flex items-center justify-center font-mono font-bold text-sm">
                04
              </span>
              <span className="font-mono text-[11px] text-[#a69fa9]">explainability=true</span>
            </div>
            <h3 className="font-space text-base uppercase text-[#f1eff0] font-bold group-hover:text-[#cbf230] transition-colors mb-2">
              Grounded Attribution Receipts
            </h3>
            <p className="font-space text-xs text-[#a69fa9] leading-relaxed">
              Returns mathematical receipts proving why each slot was selected, cross-cannibalization score, and marginal fan addition per dollar spent.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 font-mono text-[11px] text-[#cbf230] flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" /> Deterministic Vector Proof
          </div>
        </div>
      </div>

      {/* Live Qloo Request Payload & Telemetry Box */}
      <div className="bg-[#131316]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row items-stretch justify-between gap-6">
        <div className="flex-1 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-[#f1eff0]">
              <Terminal className="w-4 h-4 text-[#cbf230]" />
              <span className="font-bold">LIVE QLOO AGENTIC REQUEST PAYLOAD</span>
            </div>
            <span className="text-[#cbf230]">LATENCY: ~14.2ms</span>
          </div>
          <pre className="text-[#a69fa9] leading-relaxed overflow-x-auto bg-[#070709]/80 p-3.5 rounded-xl border border-white/10 text-[11px]">
            <code>{`POST /v2/solve/portfolio-lineup HTTP/1.1
Host: api.qloo.com
Authorization: Bearer qloo_live_oct30_demo
{
  "market": { "city": "Austin", "state": "TX", "dma": 635, "geo_weight": 0.85 },
  "budget_ceiling_usd": 250000,
  "objective": "MAX_SUBMODULAR_UNIQUE_COVERAGE",
  "cannibalization_threshold": 0.35,
  "explainability": true
}`}</code>
          </pre>
        </div>

        <div className="w-full lg:w-80 flex flex-col justify-between bg-[#070709]/80 p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] text-[#cbf230] uppercase tracking-wider">
              SOLVER TELEMETRY
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#a69fa9]">Qloo Entities Scanned</span>
              <span className="text-[#f1eff0] font-semibold">1,248 Artists</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#a69fa9]">Vector Lookups</span>
              <span className="text-[#f1eff0] font-semibold">61 Matrix Calls</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#a69fa9]">Cannibalized Discards</span>
              <span className="text-[#ffb4a3] font-semibold">43 High-Overlap</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#a69fa9]">Algorithm Runtime</span>
              <span className="text-[#cbf230] font-bold">14.2ms (Warm Cache)</span>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#a69fa9]">Seed: 0x8F9C4A2</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#cbf230]">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
