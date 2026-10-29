import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { resolveArtist } from "../src/lib/qloo/resolve";
import { buildUniverseAndMatrix } from "../src/lib/qloo/matrix";
import { solveLineup } from "../src/lib/solver";

async function main() {
  const preset = process.argv[2] ?? "--preset austin";
  console.log(`[Crowdfolio Solver] Running lineup optimization for: ${preset}\n`);

  const budget = 250000;
  const capacity = 5000;
  const actCount = 8;
  const market = "Austin";

  // Resolve seeds
  const seedNames = ["Phoebe Bridgers", "boygenius", "Lucy Dacus"];
  const seedIds: string[] = [];
  for (const name of seedNames) {
    const res = await resolveArtist(name);
    seedIds.push(res.primary.id);
  }

  // Build matrix
  const { candidates, overlap } = await buildUniverseAndMatrix({
    seeds: seedIds,
    market,
    budget,
  });

  const solverUniverse = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    popularity: c.popularity,
    genres: c.genres,
    imageUrl: c.imageUrl,
    isLocal: c.genres.some((g) => g.toLowerCase().includes("austin") || g.toLowerCase().includes("texas")),
  }));

  // Solve lineup
  const receipt = solveLineup({
    universe: solverUniverse,
    overlap,
    budget,
    capacity,
    actCount,
    stageCount: 2,
  });

  console.log(`================================================================================`);
  console.log(`OPTIMIZED LINEUP (Max-Coverage with Taste Overlap Penalties)`);
  console.log(`Budget: $${budget.toLocaleString()} | Capacity: ${capacity.toLocaleString()} | Acts: ${actCount}`);
  console.log(`================================================================================`);

  receipt.stages.forEach((stage) => {
    console.log(`\n--- ${stage.stageName} ---`);
    stage.slots.forEach((slot, idx) => {
      console.log(
        `  Slot ${idx + 1}: ${slot.name.padEnd(25)} | ` +
        `Est. Fee: $${slot.fee.toLocaleString().padStart(7)} | ` +
        `Reach: ${slot.modeledReach.toLocaleString().padStart(5)} | ` +
        `+Unique: ${slot.marginalUnique.toLocaleString().padStart(5)} | ` +
        `Closest: ${(slot.closestActName ?? "None").padEnd(16)} (overlap ${(slot.closestActOverlap * 100).toFixed(0)}%)`
      );
    });
  });

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`Total Spent: $${receipt.totalSpent.toLocaleString()} / $${budget.toLocaleString()}`);
  console.log(`Modeled Unique Demand: ${receipt.modeledUniqueDemand.toLocaleString()} attendees`);
  console.log(`Average Taste Overlap: ${(receipt.avgTasteOverlap * 100).toFixed(1)}% (Max: ${((receipt.maxTasteOverlap ?? 0) * 100).toFixed(1)}%)`);
  console.log(`Fans Per Dollar: ${receipt.fansPerDollar.toFixed(4)}`);
  console.log(`--------------------------------------------------------------------------------\n`);

  if (receipt.naiveComparison) {
    console.log(`================================================================================`);
    console.log(`NAIVE BASELINE (Greedy by Raw Popularity at Constant Budget)`);
    console.log(`================================================================================`);
    receipt.naiveComparison.acts.forEach((act, idx) => {
      console.log(`  Act ${idx + 1}: ${act.name.padEnd(25)} | Est. Fee: $${act.fee.toLocaleString().padStart(7)}`);
    });
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Naive Total Spent: $${receipt.naiveComparison.totalSpent.toLocaleString()}`);
    console.log(`Naive Unique Demand: ${receipt.naiveComparison.modeledUniqueDemand.toLocaleString()} attendees`);
    console.log(`Naive Avg Taste Overlap: ${(receipt.naiveComparison.avgTasteOverlap * 100).toFixed(1)}%`);
    console.log(`--------------------------------------------------------------------------------\n`);

    console.log(`================================================================================`);
    console.log(`THE COMPARISON (The Product's Value Claim)`);
    console.log(`================================================================================`);
    const demandLift = receipt.modeledUniqueDemand - receipt.naiveComparison.modeledUniqueDemand;
    const overlapReduction = (receipt.naiveComparison.avgTasteOverlap - receipt.avgTasteOverlap) * 100;
    console.log(`Modeled Demand Uplift: +${demandLift.toLocaleString()} fans (+${receipt.upliftPercent}%)`);
    console.log(`Taste Overlap Reduction: -${overlapReduction.toFixed(1)} percentage points`);
    console.log(`================================================================================\n`);
  }
}

main().catch((err) => {
  console.error("[Solve CLI Error]:", err);
  process.exit(1);
});
