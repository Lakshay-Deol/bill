import { BookedSlot, SolverCandidate, SolverInput } from "./types";
import { feeEstimate, getReferenceBudget, totalLineupScore } from "@/lib/model";

export interface SlotAlternative {
  id: string;
  name: string;
  popularity: number;
  fee: number;
  deltaFans: number;
  deltaCost: number;
}

/**
 * Computes top 3 viable swap candidates for each booked slot.
 * Evaluates pure deltaFans and deltaCost when replacing slot u with candidate v.
 * All calculations are deterministic and solver-computed.
 */
export function computeSlotAlternatives(
  input: SolverInput,
  currentLineup: BookedSlot[],
  currentSpend: number
): Map<string, SlotAlternative[]> {
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

  const alternativesMap = new Map<string, SlotAlternative[]>();
  const mustIncludeSet = new Set(mustInclude);
  const excludeSet = new Set(exclude);
  const selectedIds = new Set(currentLineup.map((s) => s.id));
  const feeRef = getReferenceBudget(capacity);

  const baselineScore = totalLineupScore(currentLineup, overlap, capacity);
  const effectiveMinLocals = Math.max(minLocalActs, requireLocal ? 1 : 0);

  // Available unselected candidates
  const availableCandidates = universe
    .filter((c) => !selectedIds.has(c.id) && !excludeSet.has(c.id))
    .map((c) => ({
      ...c,
      fee: feeEstimate(c.popularity, feeRef, c.feeOverride),
    }));

  for (const slot of currentLineup) {
    // If act is strictly locked (mustInclude), no alternatives are offered
    if (mustIncludeSet.has(slot.id)) {
      alternativesMap.set(slot.id, []);
      continue;
    }

    const candidateScores: SlotAlternative[] = [];

    for (const alt of availableCandidates) {
      const newSpend = currentSpend - slot.fee + alt.fee;
      if (newSpend > budget) continue;

      // Construct test lineup
      const testLineup = currentLineup.map((act) => (act.id === slot.id ? alt : act));

      // Validate local constraint
      if (effectiveMinLocals > 0) {
        const localCount = testLineup.filter((act) => act.isLocal).length;
        if (localCount < effectiveMinLocals) continue;
      }

      // Validate genre caps
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
      const deltaFans = newScore - baselineScore;
      const deltaCost = alt.fee - slot.fee;

      candidateScores.push({
        id: alt.id,
        name: alt.name,
        popularity: alt.popularity,
        fee: alt.fee,
        deltaFans,
        deltaCost,
      });
    }

    // Sort deterministically: higher deltaFans -> lower deltaCost -> entityId ascending
    candidateScores.sort((a, b) => {
      if (b.deltaFans !== a.deltaFans) {
        return b.deltaFans - a.deltaFans;
      }
      if (a.deltaCost !== b.deltaCost) {
        return a.deltaCost - b.deltaCost;
      }
      return a.id.localeCompare(b.id);
    });

    alternativesMap.set(slot.id, candidateScores.slice(0, 3));
  }

  return alternativesMap;
}

