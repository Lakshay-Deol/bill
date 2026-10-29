import { SolverCandidate, SolverInput } from "./types";
import { GreedyCandidateState } from "./greedy";
import { SWAP_ITERS } from "@/lib/model/constants";
import { feeEstimate, getReferenceBudget, totalLineupScore } from "@/lib/model";

export function localSearchSwap(
  initialLineup: GreedyCandidateState[],
  initialSpend: number,
  input: SolverInput
): {
  improvedLineup: GreedyCandidateState[];
  finalSpend: number;
} {
  const {
    universe,
    overlap,
    budget,
    capacity,
    mustInclude = [],
    exclude = [],
    requireLocal = false,
    minLocalActs = 0,
    maxPerGenre = {},
  } = input;

  const feeRef = getReferenceBudget(capacity);
  const mustIncludeSet = new Set(mustInclude);
  const excludeSet = new Set(exclude);
  const targetLocalCount = Math.max(minLocalActs, requireLocal ? 1 : 0);
  let currentLineup = [...initialLineup];
  let currentSpend = initialSpend;
  let currentScore = totalLineupScore(currentLineup, overlap, capacity);

  let iterations = 0;

  while (iterations < SWAP_ITERS) {
    iterations++;
    const selectedIds = new Set(currentLineup.map((s) => s.id));
    let bestGain = 0;
    let bestSwap: {
      outIndex: number;
      inAct: SolverCandidate;
      inFee: number;
      newSpend: number;
      newScore: number;
    } | null = null;

    // Check every pair: u in currentLineup, v in universe \ currentLineup
    for (let i = 0; i < currentLineup.length; i++) {
      const u = currentLineup[i]!;
      // Do not swap out must-include acts
      if (mustIncludeSet.has(u.id)) continue;

      for (const v of universe) {
        if (excludeSet.has(v.id)) continue;
        if (selectedIds.has(v.id)) continue;

        // Check if removing u and adding v violates local requirements
        if (targetLocalCount > 0 && u.isLocal && !v.isLocal) {
          const otherLocals = currentLineup.filter((act, idx) => idx !== i && act.isLocal).length;
          if (otherLocals < targetLocalCount) continue;
        }

        const vFee = feeEstimate(v.popularity, feeRef, v.feeOverride);
        const newSpend = currentSpend - u.fee + vFee;
        if (newSpend > budget) continue;

        // Check genre caps for replacement lineup
        const testLineup = currentLineup.map((act, idx) => (idx === i ? { ...v, fee: vFee } : act));
        const genreCounts: Record<string, number> = {};
        let genreValid = true;
        for (const act of testLineup) {
          for (const g of act.genres) {
            genreCounts[g] = (genreCounts[g] ?? 0) + 1;
            const cap = maxPerGenre[g];
            if (cap !== undefined && (genreCounts[g] ?? 0) > cap) {
              genreValid = false;
              break;
            }
          }
          if (!genreValid) break;
        }
        if (!genreValid) continue;

        const newScore = totalLineupScore(testLineup, overlap, capacity);
        const gain = newScore - currentScore;

        if (gain > bestGain + 1e-9) {
          bestGain = gain;
          bestSwap = {
            outIndex: i,
            inAct: v,
            inFee: vFee,
            newSpend,
            newScore,
          };
        } else if (Math.abs(gain - bestGain) < 1e-9 && bestGain > 0 && bestSwap) {
          // Deterministic tie-break: lower spend -> lower fee -> entityId ascending
          if (
            newSpend < bestSwap.newSpend ||
            (newSpend === bestSwap.newSpend &&
              (vFee < bestSwap.inFee ||
                (vFee === bestSwap.inFee && v.id.localeCompare(bestSwap.inAct.id) < 0)))
          ) {
            bestGain = gain;
            bestSwap = {
              outIndex: i,
              inAct: v,
              inFee: vFee,
              newSpend,
              newScore,
            };
          }
        }
      }
    }

    // If an improving swap was found, apply it
    if (bestSwap && bestGain > 0) {
      currentLineup[bestSwap.outIndex] = {
        ...bestSwap.inAct,
        fee: bestSwap.inFee,
      };
      currentSpend = bestSwap.newSpend;
      currentScore = bestSwap.newScore;
    } else {
      break; // Local optimum reached
    }
  }

  return { improvedLineup: currentLineup, finalSpend: currentSpend };
}
