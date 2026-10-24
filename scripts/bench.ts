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

  console.log(`[The Bill Benchmark] Evaluating uplift distribution across ${n} festival briefs...\n`);

  // Build a warm universe
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
    isLocal: c.genres.some((g) => g.toLowerCase().includes("indie folk")),
  }));

  // Define 20 diverse realistic festival briefs
  const budgets = [100000, 150000, 200000, 250000, 350000];
  const capacities = [2500, 4000, 5000, 8000];
  const actCounts = [6, 8, 10];

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

    const naiveDemand = receipt.naiveComparison?.modeledUniqueDemand ?? 1;
    const optDemand = receipt.modeledUniqueDemand;
    const uplift = Number((((optDemand - naiveDemand) / naiveDemand) * 100).toFixed(1));
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
  const medianUplift = uplifts[Math.floor(uplifts.length / 2)]!;
  const bestUplift = uplifts[uplifts.length - 1]!;
  const worstUplift = uplifts[0]!;

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
  console.log(`Median Uplift: +${medianUplift.toFixed(1)}%`);
  console.log(`Best Uplift:   +${bestUplift.toFixed(1)}%`);
  console.log(`Worst Uplift:  +${worstUplift.toFixed(1)}%`);
  console.log(`================================================================================\n`);
}

main().catch((err) => {
  console.error("[Bench Error]:", err);
  process.exit(1);
});
