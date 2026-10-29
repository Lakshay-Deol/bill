import { SolverInput, LineupComparisonMetrics } from "./types";
import {
  feeEstimate,
  getReferenceBudget,
  reach,
  getTasteOverlap,
  marginalUnique,
} from "@/lib/model";

/**
 * Simulates naive greedy festival booking:
 * The promoter books the biggest available acts they can afford, in order of raw draw,
 * without accounting for audience cannibalization.
 * 
 * Fills up to targetSpend (optimizer spend) so comparison is held at constant spend.
 */
export function solveNaiveBaseline(
  input: SolverInput,
  targetSpend?: number
): LineupComparisonMetrics {
  const { universe, overlap, budget, capacity, actCount } = input;
  const feeRef = getReferenceBudget(capacity);
  const effectiveBudget = targetSpend !== undefined ? targetSpend : budget;

  // Sort candidate universe by raw reach descending, tie-breaking by entityId ascending
  const sorted = [...universe].sort((a, b) => {
    const reachA = reach(a.popularity, capacity);
    const reachB = reach(b.popularity, capacity);
    if (reachB !== reachA) {
      return reachB - reachA;
    }
    return a.id.localeCompare(b.id);
  });

  const booked: Array<{ id: string; name: string; popularity: number; fee: number }> = [];
  let currentSpend = 0;

  for (const candidate of sorted) {
    if (booked.length >= actCount) break;

    const fee = feeEstimate(candidate.popularity, feeRef, candidate.feeOverride);
    if (currentSpend + fee <= effectiveBudget) {
      booked.push({
        id: candidate.id,
        name: candidate.name,
        popularity: candidate.popularity,
        fee,
      });
      currentSpend += fee;
    }
  }

  // Compute unique demand and average taste overlap using the same objective function D(S)
  let totalUniqueDemand = 0;
  for (let i = 0; i < booked.length; i++) {
    const act = booked[i]!;
    const otherActs = booked.filter((_, idx) => idx !== i);
    totalUniqueDemand += marginalUnique(act, otherActs, overlap, capacity);
  }

  let totalPairwiseOverlap = 0;
  let maxTasteOverlap = 0;
  let pairCount = 0;
  for (let i = 0; i < booked.length; i++) {
    for (let j = i + 1; j < booked.length; j++) {
      const o = getTasteOverlap(booked[i]!.id, booked[j]!.id, overlap);
      totalPairwiseOverlap += o;
      if (o > maxTasteOverlap) {
        maxTasteOverlap = o;
      }
      pairCount++;
    }
  }

  const avgTasteOverlap = pairCount > 0 ? Number((totalPairwiseOverlap / pairCount).toFixed(4)) : 0;
  const fansPerDollar = Number((totalUniqueDemand / Math.max(1, currentSpend)).toFixed(4));

  return {
    modeledUniqueDemand: totalUniqueDemand,
    totalSpent: currentSpend,
    avgTasteOverlap,
    maxTasteOverlap: Number(maxTasteOverlap.toFixed(4)),
    fansPerDollar,
    acts: booked.map((b) => ({ id: b.id, name: b.name, fee: b.fee })),
  };
}
