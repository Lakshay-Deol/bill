import { SolverInput, BookedSlot } from "./types";
import { solveLineup } from "./index";
import { feeEstimate, getReferenceBudget } from "@/lib/model";
import { createSeededPRNG } from "./prng";

export interface ActRobustness {
  id: string;
  name: string;
  selectionRate: number; // e.g. 85.0 (%)
  selectedRuns: number;
  totalRuns: number;
  status: "stable" | "swappable";
}

export interface RobustnessResult {
  runCount: number;
  perturbationPercent: number;
  acts: ActRobustness[];
}

/**
 * Robustness analysis: Re-solves lineup with fees perturbed by +/- 25%
 * across N deterministic seeded runs.
 * Identifies core load-bearing roster picks ("stable") vs marginal picks ("swappable").
 */
export function computeRobustness(
  input: SolverInput,
  primarySlots: BookedSlot[],
  runs = 20,
  seed = 0x7a1e5c
): RobustnessResult {
  const prng = createSeededPRNG(seed);
  const feeRef = getReferenceBudget(input.capacity);
  const selectedCounts = new Map<string, number>();

  for (const slot of primarySlots) {
    selectedCounts.set(slot.id, 0);
  }

  for (let r = 0; r < runs; r++) {
    // Generate perturbed candidate universe
    const perturbedUniverse = input.universe.map((candidate) => {
      const baseFee = feeEstimate(candidate.popularity, feeRef, candidate.feeOverride);
      // Uniform random perturbation in [-0.25, +0.25]
      const delta = prng() * 0.5 - 0.25;
      const perturbedFee = Math.max(1, Math.round(baseFee * (1 + delta)));

      return {
        ...candidate,
        feeOverride: perturbedFee,
      };
    });

    const perturbedResult = solveLineup({
      ...input,
      universe: perturbedUniverse,
      skipAnalysis: true,
    });

    const bookedIds = new Set(perturbedResult.lineup.map((s) => s.id));
    for (const slot of primarySlots) {
      if (bookedIds.has(slot.id)) {
        selectedCounts.set(slot.id, (selectedCounts.get(slot.id) ?? 0) + 1);
      }
    }
  }

  const acts: ActRobustness[] = primarySlots.map((slot) => {
    const count = selectedCounts.get(slot.id) ?? 0;
    const rate = Number(((count / runs) * 100).toFixed(1));
    return {
      id: slot.id,
      name: slot.name,
      selectionRate: rate,
      selectedRuns: count,
      totalRuns: runs,
      status: rate >= 70 ? "stable" : "swappable",
    };
  });

  return {
    runCount: runs,
    perturbationPercent: 25,
    acts,
  };
}
