import { BookedSlot } from "./types";

/**
 * Assigns booked slots to festival stages deterministically.
 * Stage 1 (Main Stage) gets headliners in order of descending draw.
 * Secondary stages receive supporting and local acts.
 */
export function assignStages(
  lineup: BookedSlot[],
  stageCount: number = 2
): Array<{ stageNumber: number; stageName: string; slots: BookedSlot[] }> {
  // Sort acts by popularity descending, tie-breaking by entityId
  const sorted = [...lineup].sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity;
    }
    return a.id.localeCompare(b.id);
  });

  const stages: Array<{ stageNumber: number; stageName: string; slots: BookedSlot[] }> = [];
  for (let s = 1; s <= stageCount; s++) {
    stages.push({
      stageNumber: s,
      stageName: s === 1 ? "Main Stage" : `Stage ${s}`,
      slots: [],
    });
  }

  // Assign headliners (top acts) to Main Stage, and distribute other acts
  sorted.forEach((act, idx) => {
    // If 2 stages and 6 acts: top 3 to stage 1, remaining to stage 2
    const targetStageIndex = idx < Math.ceil(sorted.length / stageCount) ? 0 : 1;
    const stageObj = stages[targetStageIndex] ?? stages[0]!;

    act.stage = stageObj.stageNumber;
    act.slotOrder = stageObj.slots.length + 1;
    stageObj.slots.push(act);
  });

  return stages;
}
