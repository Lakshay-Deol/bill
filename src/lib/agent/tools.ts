import { SolverInput, LineupReceipt, solveLineup, computeEfficientFrontier } from "@/lib/solver";
import { groundNarration } from "./ground";

export interface AgentContext {
  input: SolverInput;
  receipt: LineupReceipt;
}

export interface ToolExecutionResult {
  tool: string;
  output: Record<string, unknown>;
  receipt: LineupReceipt;
  narration: string;
}

/**
 * Creates an agent solver session with exposed tools:
 * - lock(artistIdOrName)
 * - exclude(artistIdOrName)
 * - set_budget(newBudget)
 * - compare()
 * - frontier(steps)
 * 
 * Enforces Invariant 1: narration only cites verified tool output figures.
 */
export function createSolverAgent(initialInput: SolverInput) {
  let currentInput: SolverInput = { ...initialInput };
  let currentReceipt: LineupReceipt = solveLineup(currentInput);

  function resolveActId(identifier: string): string {
    const match = currentInput.universe.find(
      (u) => u.id === identifier || u.name.toLowerCase() === identifier.toLowerCase()
    );
    return match ? match.id : identifier;
  }

  return {
    getContext(): AgentContext {
      return { input: currentInput, receipt: currentReceipt };
    },

    lock(artistIdentifier: string): ToolExecutionResult {
      const actId = resolveActId(artistIdentifier);
      const prevDemand = currentReceipt.modeledUniqueDemand;
      const prevSpend = currentReceipt.totalSpent;

      const mustInclude = Array.from(new Set([...(currentInput.mustInclude ?? []), actId]));
      // Remove from exclude if present
      const exclude = (currentInput.exclude ?? []).filter((id) => id !== actId);

      currentInput = { ...currentInput, mustInclude, exclude };
      const newReceipt = solveLineup(currentInput);
      currentReceipt = newReceipt;

      const actName = currentInput.universe.find((u) => u.id === actId)?.name ?? actId;
      const demandDelta = newReceipt.modeledUniqueDemand - prevDemand;
      const spendDelta = newReceipt.totalSpent - prevSpend;

      const output = {
        tool: "lock",
        actId,
        actName,
        newSpend: newReceipt.totalSpent,
        spendDelta,
        newUniqueDemand: newReceipt.modeledUniqueDemand,
        demandDelta,
        avgTasteOverlap: newReceipt.avgTasteOverlap,
      };

      const rawNarration = `Locked ${actName} into the lineup. Modeled unique demand is now ${newReceipt.modeledUniqueDemand} attendees (delta: ${demandDelta >= 0 ? "+" : ""}${demandDelta}), with total talent spend at $${newReceipt.totalSpent.toLocaleString()} (delta: ${spendDelta >= 0 ? "+" : ""}$${spendDelta.toLocaleString()}).`;
      const grounded = groundNarration(rawNarration, output);

      return {
        tool: "lock",
        output,
        receipt: newReceipt,
        narration: grounded.sanitizedText,
      };
    },

    exclude(artistIdentifier: string): ToolExecutionResult {
      const actId = resolveActId(artistIdentifier);
      const prevDemand = currentReceipt.modeledUniqueDemand;
      const prevSpend = currentReceipt.totalSpent;

      const exclude = Array.from(new Set([...(currentInput.exclude ?? []), actId]));
      const mustInclude = (currentInput.mustInclude ?? []).filter((id) => id !== actId);

      currentInput = { ...currentInput, exclude, mustInclude };
      const newReceipt = solveLineup(currentInput);
      currentReceipt = newReceipt;

      const actName = currentInput.universe.find((u) => u.id === actId)?.name ?? actId;
      const demandDelta = newReceipt.modeledUniqueDemand - prevDemand;
      const spendDelta = newReceipt.totalSpent - prevSpend;

      const output = {
        tool: "exclude",
        actId,
        actName,
        newSpend: newReceipt.totalSpent,
        spendDelta,
        newUniqueDemand: newReceipt.modeledUniqueDemand,
        demandDelta,
        avgTasteOverlap: newReceipt.avgTasteOverlap,
      };

      const rawNarration = `Excluded ${actName} from candidate selection. New lineup achieves ${newReceipt.modeledUniqueDemand} modeled unique fans (delta: ${demandDelta >= 0 ? "+" : ""}${demandDelta}) at $${newReceipt.totalSpent.toLocaleString()} total spend (delta: ${spendDelta >= 0 ? "+" : ""}$${spendDelta.toLocaleString()}).`;
      const grounded = groundNarration(rawNarration, output);

      return {
        tool: "exclude",
        output,
        receipt: newReceipt,
        narration: grounded.sanitizedText,
      };
    },

    set_budget(newBudget: number): ToolExecutionResult {
      const prevBudget = currentInput.budget;
      const prevDemand = currentReceipt.modeledUniqueDemand;
      const prevSpend = currentReceipt.totalSpent;

      currentInput = { ...currentInput, budget: newBudget };
      const newReceipt = solveLineup(currentInput);
      currentReceipt = newReceipt;

      const demandDelta = newReceipt.modeledUniqueDemand - prevDemand;
      const spendDelta = newReceipt.totalSpent - prevSpend;

      const output = {
        tool: "set_budget",
        previousBudget: prevBudget,
        newBudget,
        newSpend: newReceipt.totalSpent,
        spendDelta,
        newUniqueDemand: newReceipt.modeledUniqueDemand,
        demandDelta,
        avgTasteOverlap: newReceipt.avgTasteOverlap,
      };

      const rawNarration = `Adjusted talent budget ceiling from $${prevBudget.toLocaleString()} to $${newBudget.toLocaleString()}. Resulting roster achieves ${newReceipt.modeledUniqueDemand} unique demand (delta: ${demandDelta >= 0 ? "+" : ""}${demandDelta}) spending $${newReceipt.totalSpent.toLocaleString()}.`;
      const grounded = groundNarration(rawNarration, output);

      return {
        tool: "set_budget",
        output,
        receipt: newReceipt,
        narration: grounded.sanitizedText,
      };
    },

    compare(): ToolExecutionResult {
      const naive = currentReceipt.naiveComparison;
      const optDemand = currentReceipt.modeledUniqueDemand;
      const naiveDemand = naive?.modeledUniqueDemand ?? 0;
      const demandLift = optDemand - naiveDemand;
      const uplift = currentReceipt.upliftPercent ?? 0;

      const optOverlap = currentReceipt.avgTasteOverlap;
      const naiveOverlap = naive?.avgTasteOverlap ?? 0;
      const overlapReduction = Number(((naiveOverlap - optOverlap) * 100).toFixed(1));

      const output = {
        tool: "compare",
        optimizedDemand: optDemand,
        naiveDemand,
        demandLift,
        upliftPercent: uplift,
        optimizedTasteOverlap: optOverlap,
        naiveTasteOverlap: naiveOverlap,
        tasteOverlapReduction: overlapReduction,
        optimizedSpend: currentReceipt.totalSpent,
        naiveSpend: naive?.totalSpent ?? 0,
      };

      const rawNarration = `Benchmarked against naive greedy booking: optimized portfolio delivers ${optDemand} modeled fans vs. ${naiveDemand} naive (+${demandLift} fans, +${uplift}%), reducing average taste overlap by ${overlapReduction} percentage points at equivalent spend ($${currentReceipt.totalSpent.toLocaleString()} vs $${(naive?.totalSpent ?? 0).toLocaleString()}).`;
      const grounded = groundNarration(rawNarration, output);

      return {
        tool: "compare",
        output,
        receipt: currentReceipt,
        narration: grounded.sanitizedText,
      };
    },

    frontier(steps = 12): ToolExecutionResult {
      const frontierResult = computeEfficientFrontier(currentInput, steps);
      const points = frontierResult.points;
      const minPoint = points[0]!;
      const maxPoint = points[points.length - 1]!;

      const output = {
        tool: "frontier",
        stepCount: points.length,
        wallTimeMs: frontierResult.wallTimeMs,
        minBudget: minPoint.budget,
        minDemand: minPoint.optimizedDemand,
        maxBudget: maxPoint.budget,
        maxDemand: maxPoint.optimizedDemand,
        points,
      };

      const rawNarration = `Computed efficient frontier across ${points.length} budget steps in ${frontierResult.wallTimeMs}ms. Swept from $${minPoint.budget.toLocaleString()} (${minPoint.optimizedDemand} fans) to $${maxPoint.budget.toLocaleString()} (${maxPoint.optimizedDemand} fans).`;
      const grounded = groundNarration(rawNarration, output);

      return {
        tool: "frontier",
        output,
        receipt: currentReceipt,
        narration: grounded.sanitizedText,
      };
    },
  };
}

