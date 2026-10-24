export interface SolverCandidate {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  imageUrl?: string;
  isLocal?: boolean;
  feeOverride?: number;
}

export interface SolverInput {
  universe: SolverCandidate[];
  overlap: Record<string, Record<string, number>>;
  budget: number;
  capacity: number;
  actCount: number;
  mustInclude?: string[];
  requireLocal?: boolean;
  maxPerGenre?: Record<string, number>;
  stageCount?: number;
}

export interface BookedSlot {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  imageUrl?: string;
  isLocal: boolean;
  fee: number;
  modeledReach: number;
  marginalUnique: number;
  closestActId?: string;
  closestActName?: string;
  closestActOverlap: number;
  stage: number;
  slotOrder: number;
}

export interface LineupComparisonMetrics {
  modeledUniqueDemand: number;
  totalSpent: number;
  avgTasteOverlap: number;
  acts: Array<{ id: string; name: string; fee: number }>;
}

export interface LineupReceipt {
  lineup: BookedSlot[];
  totalSpent: number;
  remainingBudget: number;
  modeledUniqueDemand: number;
  avgTasteOverlap: number;
  stages: Array<{
    stageNumber: number;
    stageName: string;
    slots: BookedSlot[];
  }>;
  naiveComparison?: LineupComparisonMetrics;
  upliftPercent?: number;
}
