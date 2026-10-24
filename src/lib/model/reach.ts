import { BETA } from "./constants";

/**
 * Computes modeled distinct reach for an artist anchored to event capacity.
 * Equation: reach_i = round(CAP * p_i^BETA)
 *
 * Invariants:
 * - reach(0) === 0
 * - Monotone increasing in popularity
 * - Superlinear curvature (BETA = 1.5)
 */
export function reach(popularity: number, capacity: number): number {
  if (popularity <= 0 || capacity <= 0) return 0;
  if (popularity >= 1.0) return capacity;

  const raw = capacity * Math.pow(popularity, BETA);
  return Math.round(Math.max(0, Math.min(capacity, raw)));
}
