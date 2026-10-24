import { SolverInput, BookedSlot, LineupReceipt } from "./types";
import { solveGreedy } from "./greedy";
import { localSearchSwap } from "./local-search";
import { solveNaiveBaseline } from "./baseline";
import { assignStages } from "./stages";
import { reach, marginalUnique, getTasteOverlap } from "@/lib/model";

export * from "./types";
export * from "./greedy";
export * from "./local-search";
export * from "./baseline";
export * from "./stages";

/**
 * Pure, deterministic lineup optimizer.
 * Invariant 2: Same input -> byte-identical output. Tie-break by entityId.
 */
export function solveLineup(input: SolverInput): LineupReceipt {
  const {
    universe,
    overlap,
    budget,
    capacity,
    stageCount = 2,
  } = input;

  // 1. Monotone submodular greedy selection
  const greedy = solveGreedy(input);

  // 2. 1-swap local search refinement
  const { improvedLineup, finalSpend } = localSearchSwap(
    greedy.selected,
    greedy.currentSpend,
    input
  );

  // Sort acts deterministically by draw descending, tie-breaking by entityId
  const candidateNameMap = new Map(universe.map((c) => [c.id, c.name]));
  const sortedLineup = [...improvedLineup].sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity;
    }
    return a.id.localeCompare(b.id);
  });

  // 3. Assemble detailed slot receipts
  const bookedSlots: BookedSlot[] = sortedLineup.map((act) => {
    const otherActs = sortedLineup.filter((other) => other.id !== act.id);
    const marginal = marginalUnique(act, otherActs, overlap, capacity);
    const actReach = reach(act.popularity, capacity);

    // Identify closest already booked neighbor (highest taste overlap)
    let closestActId: string | undefined;
    let closestActOverlap = 0;

    for (const other of otherActs) {
      const o = getTasteOverlap(act.id, other.id, overlap);
      if (o > closestActOverlap) {
        closestActOverlap = o;
        closestActId = other.id;
      }
    }

    return {
      id: act.id,
      name: act.name,
      popularity: act.popularity,
      genres: act.genres,
      imageUrl: act.imageUrl,
      isLocal: !!act.isLocal,
      fee: act.fee,
      modeledReach: actReach,
      marginalUnique: marginal,
      closestActId,
      closestActName: closestActId ? candidateNameMap.get(closestActId) : undefined,
      closestActOverlap: Number(closestActOverlap.toFixed(4)),
      stage: 1,
      slotOrder: 1,
    };
  });

  // 4. Assign stages deterministically
  const stages = assignStages(bookedSlots, stageCount);

  // Compute total modeled unique demand
  const modeledUniqueDemand = bookedSlots.reduce((sum, slot) => sum + slot.marginalUnique, 0);

  // Compute average taste overlap
  let totalOverlap = 0;
  let pairCount = 0;
  for (let i = 0; i < bookedSlots.length; i++) {
    for (let j = i + 1; j < bookedSlots.length; j++) {
      totalOverlap += getTasteOverlap(bookedSlots[i]!.id, bookedSlots[j]!.id, overlap);
      pairCount++;
    }
  }
  const avgTasteOverlap = pairCount > 0 ? Number((totalOverlap / pairCount).toFixed(4)) : 0;

  // 5. Compare with naive baseline
  const naiveComparison = solveNaiveBaseline(input);
  const upliftPercent =
    naiveComparison.modeledUniqueDemand > 0
      ? Number(
          (
            ((modeledUniqueDemand - naiveComparison.modeledUniqueDemand) /
              naiveComparison.modeledUniqueDemand) *
            100
          ).toFixed(1)
        )
      : 0;

  return {
    lineup: bookedSlots,
    totalSpent: finalSpend,
    remainingBudget: Math.max(0, budget - finalSpend),
    modeledUniqueDemand,
    avgTasteOverlap,
    stages,
    naiveComparison,
    upliftPercent,
  };
}
