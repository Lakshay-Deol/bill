import { ALPHA } from "./constants";
import { reach } from "./reach";
import { getTasteOverlap } from "./overlap";

export interface ActScoringCandidate {
  id: string;
  popularity: number;
}

/**
 * Computes marginal unique demand added by candidate act to an existing lineup.
 * Equation: m_i(S) = reach_i * (1 - max_{j in S} O_ij)^ALPHA
 */
export function marginalUnique(
  candidate: ActScoringCandidate,
  bookedLineup: ActScoringCandidate[],
  overlapMatrix: Record<string, Record<string, number>>,
  capacity: number
): number {
  const baseReach = reach(candidate.popularity, capacity);
  if (bookedLineup.length === 0) {
    return baseReach;
  }

  // Find maximum tasteOverlap with any already-booked act
  let maxOverlap = 0;
  for (const booked of bookedLineup) {
    const o = getTasteOverlap(candidate.id, booked.id, overlapMatrix);
    if (o > maxOverlap) {
      maxOverlap = o;
    }
  }

  // Discount factor: (1 - maxOverlap)^ALPHA
  const discountFactor = Math.pow(Math.max(0, 1.0 - maxOverlap), ALPHA);
  return Math.round(baseReach * discountFactor);
}

/**
 * Computes selection value per dollar for greedy ranking.
 * Equation: value_i = m_i(S) / fee_i
 */
export function valuePerDollar(marginalDemand: number, fee: number): number {
  if (fee <= 0) return 0;
  return marginalDemand / fee;
}

/**
 * Computes total modeled unique demand D(S) for a complete lineup.
 * Equation: D(S) = sum_{i in S} m_i(S \ {i})
 */
export function totalLineupScore(
  lineup: ActScoringCandidate[],
  overlapMatrix: Record<string, Record<string, number>>,
  capacity: number
): number {
  let total = 0;
  for (let i = 0; i < lineup.length; i++) {
    const act = lineup[i]!;
    const otherActs = lineup.filter((_, idx) => idx !== i);
    total += marginalUnique(act, otherActs, overlapMatrix, capacity);
  }
  return total;
}
