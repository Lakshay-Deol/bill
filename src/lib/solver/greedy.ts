import { SolverCandidate, SolverInput } from "./types";
import {
  feeEstimate,
  getReferenceBudget,
  reach,
  getTasteOverlap,
  marginalUnique,
  valuePerDollar,
} from "@/lib/model";

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
    exclude = [],
    requireLocal = false,
    minLocalActs = 0,
    maxPerGenre = {},
  } = input;

  // Anchor talent fee scale to festival capacity/market tier
  const feeRef = getReferenceBudget(capacity);
  const excludeSet = new Set(exclude);

  const candidateMap = new Map<string, SolverCandidate>(
    universe.filter((c) => !excludeSet.has(c.id)).map((c) => [c.id, c])
  );
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
    .filter((id) => !excludeSet.has(id))
    .map((id) => candidateMap.get(id))
    .filter((act): act is SolverCandidate => act !== undefined)
    .sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      return a.id.localeCompare(b.id);
    });

  for (const act of mustIncludeActs) {
    if (selected.length >= actCount) break;
    const fee = feeEstimate(act.popularity, feeRef, act.feeOverride);
    if (currentSpend + fee <= budget && canAddGenre(act.genres)) {
      addAct(act, fee);
    }
  }

  // 2. Greedy selection loop
  const selectedIds = new Set(selected.map((s) => s.id));
  const targetLocalCount = Math.max(minLocalActs, requireLocal ? 1 : 0);

  while (selected.length < actCount) {
    const remainingSlots = actCount - selected.length;
    const currentLocals = selected.filter((s) => s.isLocal).length;
    const neededLocals = Math.max(0, targetLocalCount - currentLocals);
    const needLocalImmediately = neededLocals >= remainingSlots;

    let bestCandidate: SolverCandidate | null = null;
    let bestValue = -1;
    let bestFee = Infinity;

    // Evaluate all feasible unselected candidates
    for (const candidate of universe) {
      if (excludeSet.has(candidate.id)) continue;
      if (selectedIds.has(candidate.id)) continue;
      if (needLocalImmediately && !candidate.isLocal) continue;

      const fee = feeEstimate(candidate.popularity, feeRef, candidate.feeOverride);
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
