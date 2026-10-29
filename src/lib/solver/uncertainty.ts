import { BookedSlot } from "./types";
import { marginalUnique } from "@/lib/model";
import { createSeededPRNG } from "./prng";

export interface UncertaintyBands {
  p10: number;
  p50: number;
  p90: number;
  sampleCount: number;
  isModeled: true;
}

/**
 * Seeded Monte Carlo simulation on modeled reach.
 * Evaluates audience uncertainty across +/- 15% draw variance per artist.
 * Returns modeled p10 (conservative downside), p50 (median), and p90 (optimistic upside).
 */
export function computeUncertaintyBands(
  lineup: BookedSlot[],
  overlap: Record<string, Record<string, number>>,
  capacity: number,
  samples = 200,
  seed = 0x5eedcafe
): UncertaintyBands {
  if (lineup.length === 0) {
    return {
      p10: 0,
      p50: 0,
      p90: 0,
      sampleCount: samples,
      isModeled: true,
    };
  }

  const prng = createSeededPRNG(seed);
  const simulatedDemands: number[] = [];

  for (let s = 0; s < samples; s++) {
    // Generate perturbed reach candidates for this sample
    const sampleActs = lineup.map((act) => {
      // Perturb draw by +/- 15%
      const perturbation = prng() * 0.3 - 0.15;
      const perturbedPop = Math.max(0.05, Math.min(0.99, act.popularity * (1 + perturbation)));
      return {
        id: act.id,
        popularity: perturbedPop,
      };
    });

    let totalDemand = 0;
    for (let i = 0; i < sampleActs.length; i++) {
      const act = sampleActs[i]!;
      const otherActs = sampleActs.filter((_, idx) => idx !== i);
      totalDemand += marginalUnique(act, otherActs, overlap, capacity);
    }

    simulatedDemands.push(Math.round(totalDemand));
  }

  simulatedDemands.sort((a, b) => a - b);

  const idx10 = Math.floor(0.1 * samples);
  const idx50 = Math.floor(0.5 * samples);
  const idx90 = Math.min(samples - 1, Math.floor(0.9 * samples));

  return {
    p10: simulatedDemands[idx10] ?? 0,
    p50: simulatedDemands[idx50] ?? 0,
    p90: simulatedDemands[idx90] ?? 0,
    sampleCount: samples,
    isModeled: true,
  };
}

