import { BookedSlot } from "./types";
import { getTasteOverlap } from "@/lib/model";

export interface StageAssignmentResult {
  stages: Array<{ stageNumber: number; stageName: string; slots: BookedSlot[] }>;
  days: Array<{ dayNumber: number; dayName: string; slots: BookedSlot[] }>;
}

/**
 * Assigns booked slots to festival stages and days deterministically.
 * Spreads high-overlap acts apart across different stages and days
 * to minimize direct intra-stage/intra-day audience cannibalization.
 */
export function assignStages(
  lineup: BookedSlot[],
  stageCount = 2,
  dayCount = 1,
  overlap: Record<string, Record<string, number>> = {}
): StageAssignmentResult {
  // Sort acts deterministically by draw descending, tie-breaking by entityId
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

  const days: Array<{ dayNumber: number; dayName: string; slots: BookedSlot[] }> = [];
  for (let d = 1; d <= dayCount; d++) {
    days.push({
      dayNumber: d,
      dayName: `Day ${d}`,
      slots: [],
    });
  }

  // 1. Stage assignment: spread high-overlap acts across stages
  for (let idx = 0; idx < sorted.length; idx++) {
    const act = sorted[idx]!;

    // Find the stage with minimal cumulative taste overlap with already booked acts
    let bestStageIdx = 0;
    let minStageOverlap = Infinity;
    const maxSlotsPerStage = Math.ceil(sorted.length / stageCount);

    for (let s = 0; s < stageCount; s++) {
      const stage = stages[s]!;
      if (stage.slots.length >= maxSlotsPerStage) continue;

      let stageOverlapSum = 0;
      for (const booked of stage.slots) {
        stageOverlapSum += getTasteOverlap(act.id, booked.id, overlap);
      }

      if (stageOverlapSum < minStageOverlap) {
        minStageOverlap = stageOverlapSum;
        bestStageIdx = s;
      }
    }

    const chosenStage = stages[bestStageIdx]!;
    act.stage = chosenStage.stageNumber;
    act.slotOrder = chosenStage.slots.length + 1;
    chosenStage.slots.push(act);

    // 2. Day assignment: spread high-overlap acts across days if multi-day
    let bestDayIdx = 0;
    let minDayOverlap = Infinity;
    const maxSlotsPerDay = Math.ceil(sorted.length / dayCount);

    for (let d = 0; d < dayCount; d++) {
      const day = days[d]!;
      if (day.slots.length >= maxSlotsPerDay) continue;

      let dayOverlapSum = 0;
      for (const booked of day.slots) {
        dayOverlapSum += getTasteOverlap(act.id, booked.id, overlap);
      }

      if (dayOverlapSum < minDayOverlap) {
        minDayOverlap = dayOverlapSum;
        bestDayIdx = d;
      }
    }

    const chosenDay = days[bestDayIdx]!;
    act.day = chosenDay.dayNumber;
    act.dayName = chosenDay.dayName;
    chosenDay.slots.push(act);
  }

  return { stages, days };
}
