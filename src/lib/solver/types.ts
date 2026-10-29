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
  exclude?: string[];
  requireLocal?: boolean;
  minLocalActs?: number;
  maxPerGenre?: Record<string, number>;
  stageCount?: number;
  dayCount?: number;
  skipAnalysis?: boolean;
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
  day?: number;
  dayName?: string;
  status?: "stable" | "swappable";
  selectionRate?: number;
  alternatives?: Array<{
    id: string;
    name: string;
    popularity: number;
    fee: number;
    deltaFans: number;
    deltaCost: number;
  }>;
}

export interface LineupComparisonMetrics {
  modeledUniqueDemand: number;
  totalSpent: number;
  avgTasteOverlap: number;
  maxTasteOverlap?: number;
  fansPerDollar: number;
  acts: Array<{ id: string; name: string; fee: number }>;
}

export interface LineupReceipt {
  lineup: BookedSlot[];
  totalSpent: number;
  remainingBudget: number;
  modeledUniqueDemand: number;
  avgTasteOverlap: number;
  maxTasteOverlap?: number;
  fansPerDollar: number;
  stages: Array<{
    stageNumber: number;
    stageName: string;
    slots: BookedSlot[];
  }>;
  days?: Array<{
    dayNumber: number;
    dayName: string;
    slots: BookedSlot[];
  }>;
  uncertainty?: {
    p10: number;
    p50: number;
    p90: number;
    sampleCount: number;
    isModeled: true;
  };
  robustness?: {
    runCount: number;
    perturbationPercent: number;
    acts: Array<{
      id: string;
      name: string;
      selectionRate: number;
      status: "stable" | "swappable";
    }>;
  };
  naiveComparison?: LineupComparisonMetrics;
  upliftPercent?: number;
}
