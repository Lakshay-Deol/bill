import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { resolveArtist } from "../src/lib/qloo/resolve";
import { buildUniverseAndMatrix } from "../src/lib/qloo/matrix";


function parseArgs() {
  const args = process.argv.slice(2);
  let market = "Austin";
  let budget = 250000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--market" && args[i + 1]) {
      market = args[i + 1]!;
      i++;
    } else if (args[i] === "--budget" && args[i + 1]) {
      budget = parseInt(args[i + 1]!, 10);
      i++;
    }
  }
  return { market, budget };
}

async function main() {
  const { market, budget } = parseArgs();
  console.log(`[Taste Matrix] Building universe for Market: ${market}, Budget: $${budget.toLocaleString()}...`);

  // Resolve 3 seed acts for the brief
  const seedNames = ["Phoebe Bridgers", "boygenius", "Lucy Dacus"];
  const seedIds: string[] = [];

  for (const name of seedNames) {
    const res = await resolveArtist(name);
    seedIds.push(res.primary.id);
    console.log(`  -> Seed "${name}" resolved to ${res.primary.id}`);
  }

  // Build universe and matrix
  const result = await buildUniverseAndMatrix({
    seeds: seedIds,
    market,
    budget,
    universeCap: 120,
    enrichCap: 40,
  });

  const enrichedCount = result.candidates.filter((c) => c.isEnriched).length;
  const elapsedSec = (result.callStats.wallTimeMs / 1000).toFixed(1);

  console.log(`-> ${result.candidates.length} candidates, ${enrichedCount} enriched`);
  console.log(`-> ${result.callStats.totalCalls} calls, ${result.callStats.cacheHits} cached, ${elapsedSec}s`);

  // Find top overlapping pairs (excluding self-overlap of 1.0)
  const pairs: Array<{ actA: string; actB: string; score: number }> = [];
  const candidateNames = new Map(result.candidates.map((c) => [c.id, c.name]));

  for (let i = 0; i < result.candidates.length; i++) {
    const actA = result.candidates[i]!;
    for (let j = i + 1; j < result.candidates.length; j++) {
      const actB = result.candidates[j]!;
      const score = result.overlap[actA.id]?.[actB.id] ?? 0;
      if (score > 0) {
        pairs.push({
          actA: candidateNames.get(actA.id) ?? actA.id,
          actB: candidateNames.get(actB.id) ?? actB.id,
          score,
        });
      }
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  if (pairs.length > 0) {
    const topPair = pairs[0]!;
    console.log(`-> top overlap pair: ${topPair.actA} / ${topPair.actB} = ${topPair.score.toFixed(2)}`);
  }

  console.log(`\n--- Top 5 Taste Overlap Pairs (Sanity Check) ---`);
  pairs.slice(0, 5).forEach((p, idx) => {
    console.log(`  ${idx + 1}. ${p.actA} / ${p.actB}: ${p.score.toFixed(4)}`);
  });
}

main().catch((err) => {
  console.error("[Matrix Build Error]:", err);
  process.exit(1);
});
