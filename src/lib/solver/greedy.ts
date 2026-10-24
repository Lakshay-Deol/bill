import { SolverCandidate, SolverInput } from "./types";
import { feeEstimate, reach, getTasteOverlap, marginalUnique, valuePerDollar } from "@/lib/model";

export interface GreedyCandidateState extends SolverCandidate {
  fee: number;
}

export function solveGreedy(input: SolverInput): {
  selected: GreedyCandidateState[];
  currentSpend: number;
} {
  const {
    universe,
    overlap,
    budget,
    capacity,
    actCount,
    mustInclude = [],
    requireLocal = false,
    maxPerGenre = {},
  } = input;

  const candidateMap = new Map<string, SolverCandidate>(universe.map((c) => [c.id, c]));
  const selected: GreedyCandidateState[] = [];
  let currentSpend = 0;

  // Track genre counts
  const genreCounts: Record<string, number> = {};

  function canAddGenre(genres: string[]): boolean {
    for (const g of genres) {
      const cap = maxPerGenre[g];
      if (cap !== undefined && (genreCounts[g] ?? 0) >= cap) {
        return false;
      }
    }
    return true;
  }

  function addAct(act: SolverCandidate, fee: number) {
    selected.push({ ...act, fee });
    currentSpend += fee;
    for (const g of act.genres) {
      genreCounts[g] = (genreCounts[g] ?? 0) + 1;
    }
  }

  // 1. Force must-include acts if feasible, sorted deterministically by popularity descending
  const mustIncludeActs = mustInclude
    .map((id) => candidateMap.get(id))
    .filter((act): act is SolverCandidate => act !== undefined)
    .sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      return a.id.localeCompare(b.id);
    });

  for (const act of mustIncludeActs) {
    if (selected.length >= actCount) break;
    const fee = feeEstimate(act.popularity, budget, act.feeOverride);
    if (currentSpend + fee <= budget && canAddGenre(act.genres)) {
      addAct(act, fee);
    }
  }

  // 2. Greedy selection loop
  const selectedIds = new Set(selected.map((s) => s.id));

  while (selected.length < actCount) {
    const remainingSlots = actCount - selected.length;
    const hasLocalBooked = selected.some((s) => s.isLocal);
    const needLocalImmediately = requireLocal && !hasLocalBooked && remainingSlots === 1;

    let bestCandidate: SolverCandidate | null = null;
    let bestValue = -1;
    let bestFee = Infinity;

    // Evaluate all feasible unselected candidates
    for (const candidate of universe) {
      if (selectedIds.has(candidate.id)) continue;
      if (needLocalImmediately && !candidate.isLocal) continue;

      const fee = feeEstimate(candidate.popularity, budget, candidate.feeOverride);
      if (currentSpend + fee > budget) continue;
      if (!canAddGenre(candidate.genres)) continue;

      const marginal = marginalUnique(candidate, selected, overlap, capacity);
      const value = valuePerDollar(marginal, fee);

      // Deterministic comparison: higher value -> lower fee -> entityId ascending
      if (value > bestValue) {
        bestValue = value;
        bestFee = fee;
        bestCandidate = candidate;
      } else if (Math.abs(value - bestValue) < 1e-9) {
        if (fee < bestFee) {
          bestFee = fee;
          bestCandidate = candidate;
        } else if (fee === bestFee && bestCandidate && candidate.id.localeCompare(bestCandidate.id) < 0) {
          bestCandidate = candidate;
        }
      }
    }

    if (!bestCandidate) {
      break; // No further feasible candidate can be added within budget and constraints
    }

    addAct(bestCandidate, bestFee);
    selectedIds.add(bestCandidate.id);
  }

  return { selected, currentSpend };
}
