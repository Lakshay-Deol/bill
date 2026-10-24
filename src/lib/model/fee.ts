import { GAMMA, FEE_FLOOR_RATIO, FEE_TOP_RATIO } from "./constants";

export interface FeeEstimateResult {
  amount: number;
  isEstimate: true; // Hard invariant 7: Every fee renders with an est. marker
  isOverridden: boolean;
}

/**
 * Heuristic fee estimator scaled to promoter's talent budget.
 * Equation: fee_i = FLOOR + (CEILING - FLOOR) * p_i^GAMMA
 *
 * Invariants:
 * - Monotone increasing in popularity
 * - Never exceeds 0.45 * budget
 * - Never drops below 0.02 * budget
 */
export function feeEstimate(
  popularity: number,
  budget: number,
  userOverride?: number
): number {
  if (userOverride !== undefined && userOverride >= 0) {
    return Math.round(userOverride);
  }

  const p = Math.max(0, Math.min(1, popularity));
  const floor = budget * FEE_FLOOR_RATIO;
  const ceiling = budget * FEE_TOP_RATIO;

  const raw = floor + (ceiling - floor) * Math.pow(p, GAMMA);
  return Math.round(Math.max(floor, Math.min(ceiling, raw)));
}
