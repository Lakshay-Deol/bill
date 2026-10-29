import { SolverInput } from "./types";
import { solveLineup } from "./index";

export interface FrontierPoint {
  budget: number;
  optimizedSpend: number;
  optimizedDemand: number;
  optimizedAvgTasteOverlap: number;
  naiveSpend: number;
  naiveDemand: number;
  naiveAvgTasteOverlap: number;
  upliftPercent: number;
}

export interface FrontierResult {
  baseBudget: number;
  points: FrontierPoint[];
  wallTimeMs: number;
}

/**
 * Computes the efficient frontier by sweeping talent budget from 40% to 120%
 * in discrete deterministic steps.
 * Evaluates distinct modeled reach vs spend for optimized vs naive.
 */
export function computeEfficientFrontier(
  input: SolverInput,
  steps = 12,
  minRatio = 0.4,
  maxRatio = 1.2
): FrontierResult {
  const start = Date.now();
  const baseBudget = input.budget;
  const points: FrontierPoint[] = [];

  const stepSize = steps > 1 ? (maxRatio - minRatio) / (steps - 1) : 0;

  for (let i = 0; i < steps; i++) {
    const ratio = Number((minRatio + i * stepSize).toFixed(4));
    const budgetStep = Math.round(baseBudget * ratio);

    const receipt = solveLineup({
      ...input,
      budget: budgetStep,
      skipAnalysis: true,
    });

    const naive = receipt.naiveComparison;

    points.push({
      budget: budgetStep,
      optimizedSpend: receipt.totalSpent,
      optimizedDemand: receipt.modeledUniqueDemand,
      optimizedAvgTasteOverlap: receipt.avgTasteOverlap,
      naiveSpend: naive?.totalSpent ?? 0,
      naiveDemand: naive?.modeledUniqueDemand ?? 0,
      naiveAvgTasteOverlap: naive?.avgTasteOverlap ?? 0,
      upliftPercent: receipt.upliftPercent ?? 0,
    });
  }

  const wallTimeMs = Date.now() - start;

  return {
    baseBudget,
    points,
    wallTimeMs,
  };
}
