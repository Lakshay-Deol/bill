import {
  GAMMA,
  FEE_FLOOR_RATIO,
  FEE_TOP_RATIO,
  TALENT_PER_CAPITA,
  BASE_REFERENCE_BUDGET,
} from "./constants";

export interface FeeEstimateResult {
  amount: number;
  isEstimate: true; // Hard invariant 7: Every fee renders with an est. marker
  isOverridden: boolean;
}

/**
 * Calculates the reference talent budget anchored to festival capacity.
 * Ensures talent market costs remain absolute and grounded in scale,
 * allowing the promoter's budget slider to actively bind and restructure lineups.
 */
export function getReferenceBudget(capacity?: number): number {
  if (capacity && capacity > 0) {
    return capacity * TALENT_PER_CAPITA;
  }
  return BASE_REFERENCE_BUDGET;
}

/**
 * Heuristic fee estimator anchored to market reference scale.
 * Equation: fee_i = FLOOR + (CEILING - FLOOR) * p_i^GAMMA
 *
 * Invariants:
 * - Monotone increasing in popularity
 * - Anchored to capacity/market reference budget (not floating with slider)
 * - User fee overrides strictly respected
 */
export function feeEstimate(
  popularity: number,
  referenceBudget: number = BASE_REFERENCE_BUDGET,
  userOverride?: number
): number {
  if (userOverride !== undefined && userOverride >= 0) {
    return Math.round(userOverride);
  }

  const p = Math.max(0, Math.min(1, popularity));
  const floor = referenceBudget * FEE_FLOOR_RATIO;
  const ceiling = referenceBudget * FEE_TOP_RATIO;

  const raw = floor + (ceiling - floor) * Math.pow(p, GAMMA);
  return Math.round(Math.max(floor, Math.min(ceiling, raw)));
}
