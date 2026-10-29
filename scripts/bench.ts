import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { resolveArtist } from "../src/lib/qloo/resolve";
import { buildUniverseAndMatrix } from "../src/lib/qloo/matrix";
import { solveLineup } from "../src/lib/solver";

async function main() {
  const args = process.argv.slice(2);
  let n = 20;
  const nIndex = args.indexOf("--n");
  if (nIndex !== -1 && args[nIndex + 1]) {
    n = parseInt(args[nIndex + 1]!, 10);
  }

  console.log(`[Crowdfolio Benchmark] Evaluating uplift distribution across ${n} festival briefs...\n`);

  // Build candidate universe
  const seedNames = ["Phoebe Bridgers", "boygenius", "Lucy Dacus"];
  const seedIds: string[] = [];
  for (const name of seedNames) {
    const res = await resolveArtist(name);
    seedIds.push(res.primary.id);
  }

  const { candidates, overlap } = await buildUniverseAndMatrix({
    seeds: seedIds,
    market: "Austin",
    budget: 250000,
  });

  const solverUniverse = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    popularity: c.popularity,
    genres: c.genres,
    imageUrl: c.imageUrl,
    isLocal: c.genres.some((g) => g.toLowerCase().includes("indie folk") || g.toLowerCase().includes("austin")),
  }));

  // Define diverse realistic festival briefs across budgets, capacities, and slot counts
  const budgets = [80000, 120000, 160000, 200000, 250000, 320000, 450000];
  const capacities = [2000, 3500, 5000, 7500, 10000];
  const actCounts = [4, 6, 8, 10, 12];

  const results: Array<{
    brief: string;
    budget: number;
    capacity: number;
    acts: number;
    optimizedDemand: number;
    naiveDemand: number;
    uplift: number;
    overlapReduction: number;
  }> = [];

  for (let i = 0; i < n; i++) {
    const b = budgets[i % budgets.length]!;
    const cap = capacities[i % capacities.length]!;
    const count = actCounts[i % actCounts.length]!;
    const reqLocal = i % 2 === 0;

    const receipt = solveLineup({
      universe: solverUniverse,
      overlap,
      budget: b,
      capacity: cap,
      actCount: count,
      requireLocal: reqLocal,
    });

    const naiveDemand = receipt.naiveComparison?.modeledUniqueDemand ?? 0;
    const optDemand = receipt.modeledUniqueDemand;
    const uplift =
      naiveDemand > 0
        ? Number((((optDemand - naiveDemand) / naiveDemand) * 100).toFixed(1))
        : optDemand > 0
        ? 100
        : 0;
    const overlapRed = Number(
      (((receipt.naiveComparison?.avgTasteOverlap ?? 0) - receipt.avgTasteOverlap) * 100).toFixed(1)
    );

    results.push({
      brief: `Brief #${i + 1} ($${(b / 1000).toFixed(0)}k, ${count} acts, cap ${cap}${reqLocal ? ", local" : ""})`,
      budget: b,
      capacity: cap,
      acts: count,
      optimizedDemand: optDemand,
      naiveDemand,
      uplift,
      overlapReduction: overlapRed,
    });
  }

  const uplifts = results.map((r) => r.uplift).sort((a, b) => a - b);
  const minUplift = uplifts[0]!;
  const q1Uplift = uplifts[Math.floor(uplifts.length * 0.25)]!;
  const medianUplift = uplifts[Math.floor(uplifts.length / 2)]!;
  const q3Uplift = uplifts[Math.floor(uplifts.length * 0.75)]!;
  const iqrUplift = Number((q3Uplift - q1Uplift).toFixed(1));
  const maxUplift = uplifts[uplifts.length - 1]!;
  const positiveCount = uplifts.filter((u) => u > 0).length;
  const positiveShare = Number(((positiveCount / uplifts.length) * 100).toFixed(1));

  console.log(`| # | Brief | Opt. Demand | Naive Demand | Uplift | Overlap Red. |`);
  console.log(`|---|---|---|---|---|---|`);
  results.forEach((r, idx) => {
    console.log(
      `| ${idx + 1} | ${r.brief.padEnd(35)} | ${r.optimizedDemand.toLocaleString().padStart(6)} | ` +
      `${r.naiveDemand.toLocaleString().padStart(6)} | +${r.uplift.toFixed(1)}% | -${r.overlapReduction.toFixed(1)}% |`
    );
  });

  console.log(`\n================================================================================`);
  console.log(`BENCHMARK SUMMARY (${n} BRIEFS)`);
  console.log(`================================================================================`);
  console.log(`Min Uplift:           +${minUplift.toFixed(1)}%`);
  console.log(`Q1 Uplift:            +${q1Uplift.toFixed(1)}%`);
  console.log(`Median Uplift:        +${medianUplift.toFixed(1)}%`);
  console.log(`Q3 Uplift:            +${q3Uplift.toFixed(1)}%`);
  console.log(`IQR (Spread):          ${iqrUplift.toFixed(1)} percentage points`);
  console.log(`Max Uplift:           +${maxUplift.toFixed(1)}%`);
  console.log(`Positive Uplift Runs:  ${positiveCount}/${uplifts.length} (${positiveShare}%)`);
  console.log(`================================================================================\n`);
}

main().catch((err) => {
  console.error("[Bench Error]:", err);
  process.exit(1);
});
