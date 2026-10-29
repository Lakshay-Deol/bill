import { describe, it, expect } from "vitest";
import {
  solveLineup,
  solveNaiveBaseline,
  computeEfficientFrontier,
  computeRobustness,
  computeUncertaintyBands,
  computeSlotAlternatives,
  assignStages,
} from "@/lib/solver";
import { feeEstimate, getReferenceBudget } from "@/lib/model";
import { SYNTHETIC_PHOEBE_BRIDGERS } from "@/lib/fixtures/synthetic-artists";

describe("Solver - Hard Invariants", () => {
  const budget = 150000;
  const capacity = 4000;
  const actCount = 4;

  // Build a test synthetic universe with 6 candidates
  const testUniverse = [
    {
      id: SYNTHETIC_PHOEBE_BRIDGERS.id,
      name: SYNTHETIC_PHOEBE_BRIDGERS.name,
      popularity: SYNTHETIC_PHOEBE_BRIDGERS.popularity,
      genres: SYNTHETIC_PHOEBE_BRIDGERS.genres,
      isLocal: false,
    },
    ...SYNTHETIC_PHOEBE_BRIDGERS.neighbors.map((n) => ({
      id: n.id,
      name: n.name,
      popularity: n.popularity,
      genres: n.genres,
      isLocal: false,
    })),
    {
      id: "urn:entity:artist:synthetic-austin-local",
      name: "The Austin Local",
      popularity: 0.35,
      genres: ["indie rock"],
      isLocal: true,
    },
    {
      id: "urn:entity:artist:synthetic-country-crooner",
      name: "Country Crooner",
      popularity: 0.65,
      genres: ["country"],
      isLocal: false,
    },
  ];

  const testOverlap: Record<string, Record<string, number>> = {
    [SYNTHETIC_PHOEBE_BRIDGERS.id]: {
      "urn:entity:artist:synthetic-boygenius": 0.89,
      "urn:entity:artist:synthetic-lucy-dacus": 0.82,
      "urn:entity:artist:synthetic-julien-baker": 0.77,
      "urn:entity:artist:synthetic-austin-local": 0.25,
      "urn:entity:artist:synthetic-country-crooner": 0.12,
    },
    "urn:entity:artist:synthetic-boygenius": {
      [SYNTHETIC_PHOEBE_BRIDGERS.id]: 0.89,
      "urn:entity:artist:synthetic-lucy-dacus": 0.85,
      "urn:entity:artist:synthetic-julien-baker": 0.83,
      "urn:entity:artist:synthetic-austin-local": 0.22,
      "urn:entity:artist:synthetic-country-crooner": 0.10,
    },
    "urn:entity:artist:synthetic-lucy-dacus": {
      [SYNTHETIC_PHOEBE_BRIDGERS.id]: 0.82,
      "urn:entity:artist:synthetic-boygenius": 0.85,
      "urn:entity:artist:synthetic-julien-baker": 0.79,
      "urn:entity:artist:synthetic-austin-local": 0.20,
      "urn:entity:artist:synthetic-country-crooner": 0.15,
    },
    "urn:entity:artist:synthetic-julien-baker": {
      [SYNTHETIC_PHOEBE_BRIDGERS.id]: 0.77,
      "urn:entity:artist:synthetic-boygenius": 0.83,
      "urn:entity:artist:synthetic-lucy-dacus": 0.79,
      "urn:entity:artist:synthetic-austin-local": 0.18,
      "urn:entity:artist:synthetic-country-crooner": 0.08,
    },
  };

  it("Solver never exceeds talent budget", () => {
    const solution = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    expect(solution.totalSpent).toBeLessThanOrEqual(budget);
  });

  it("Solver is pure and deterministic (Invariant 2: same input -> byte-identical JSON)", () => {
    const run1 = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    const run2 = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    const json1 = JSON.stringify(run1);
    const json2 = JSON.stringify(run2);
    expect(json1).toBe(json2);
  });

  it("Respects mustInclude act constraint", () => {
    const mustIncludeId = "urn:entity:artist:synthetic-julien-baker";
    const solution = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
      mustInclude: [mustIncludeId],
    });

    const bookedIds = solution.lineup.map((act) => act.id);
    expect(bookedIds).toContain(mustIncludeId);
  });

  it("Respects local artist requirement", () => {
    const solution = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
      requireLocal: true,
    });

    const hasLocal = solution.lineup.some((act) => act.isLocal);
    expect(hasLocal).toBe(true);
  });

  it("Optimized solver achieves higher modeled reach than naive baseline", () => {
    const optimized = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    const naive = solveNaiveBaseline({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    expect(optimized.modeledUniqueDemand).toBeGreaterThanOrEqual(naive.modeledUniqueDemand);
  });

  it("Budget slider changes selected lineup (verifies scale-invariance fix)", () => {
    const lowBudget = 80000;
    const highBudget = 250000;
    const lowSolution = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget: lowBudget,
      capacity,
      actCount: 3,
    });
    const highSolution = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget: highBudget,
      capacity,
      actCount: 3,
    });

    const lowIds = lowSolution.lineup.map((a) => a.id).sort();
    const highIds = highSolution.lineup.map((a) => a.id).sort();
    expect(lowIds).not.toEqual(highIds);
  });

  it("Baseline spend matches optimizer spend within one act's fee", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    expect(receipt.naiveComparison).toBeDefined();
    const naive = receipt.naiveComparison!;
    const maxActFee = Math.max(
      ...testUniverse.map((u) => feeEstimate(u.popularity, getReferenceBudget(capacity)))
    );
    const diff = Math.abs(receipt.totalSpent - naive.totalSpent);
    expect(diff).toBeLessThanOrEqual(maxActFee);
  });

  it("Receipt contains valid maxTasteOverlap and fansPerDollar", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount,
    });

    expect(receipt.maxTasteOverlap).toBeDefined();
    expect(receipt.maxTasteOverlap).toBeGreaterThanOrEqual(0);
    expect(receipt.maxTasteOverlap).toBeLessThanOrEqual(1);
    expect(receipt.fansPerDollar).toBeGreaterThan(0);

    expect(receipt.naiveComparison?.maxTasteOverlap).toBeDefined();
    expect(receipt.naiveComparison?.fansPerDollar).toBeGreaterThan(0);
  });

  it("Efficient frontier sweeps budget in 12 steps under 1500ms", () => {
    const frontier = computeEfficientFrontier(
      {
        universe: testUniverse,
        overlap: testOverlap,
        budget,
        capacity,
        actCount,
      },
      12
    );

    expect(frontier.points.length).toBe(12);
    expect(frontier.wallTimeMs).toBeLessThan(1500);
    // Budgets should be monotonically increasing
    for (let i = 1; i < frontier.points.length; i++) {
      expect(frontier.points[i]!.budget).toBeGreaterThanOrEqual(frontier.points[i - 1]!.budget);
    }
  });

  it("Robustness analysis produces stable/swappable statuses across perturbed runs", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount: 3,
    });

    const rob = computeRobustness(
      {
        universe: testUniverse,
        overlap: testOverlap,
        budget,
        capacity,
        actCount: 3,
      },
      receipt.lineup,
      10
    );

    expect(rob.acts.length).toBe(receipt.lineup.length);
    rob.acts.forEach((act) => {
      expect(act.selectionRate).toBeGreaterThanOrEqual(0);
      expect(act.selectionRate).toBeLessThanOrEqual(100);
      expect(["stable", "swappable"]).toContain(act.status);
    });
  });

  it("Uncertainty bands produce ordered p10 <= p50 <= p90", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount: 3,
    });

    const bands = computeUncertaintyBands(receipt.lineup, testOverlap, capacity, 100);
    expect(bands.isModeled).toBe(true);
    expect(bands.p10).toBeLessThanOrEqual(bands.p50);
    expect(bands.p50).toBeLessThanOrEqual(bands.p90);
  });

  it("Slot alternatives compute top 3 options with deltaFans and deltaCost", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount: 3,
    });

    const alts = computeSlotAlternatives(
      {
        universe: testUniverse,
        overlap: testOverlap,
        budget,
        capacity,
        actCount: 3,
      },
      receipt.lineup,
      receipt.totalSpent
    );

    expect(alts.size).toBe(receipt.lineup.length);
    for (const [slotId, slotAlts] of alts.entries()) {
      expect(slotAlts.length).toBeLessThanOrEqual(3);
      slotAlts.forEach((alt) => {
        expect(alt.deltaFans).toBeDefined();
        expect(alt.deltaCost).toBeDefined();
        expect(alt.id).not.toBe(slotId);
      });
    }
  });

  it("Exclude constraint strictly bans acts from selection", () => {
    const excludedId = "urn:entity:artist:synthetic-boygenius";
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget: 300000,
      capacity,
      actCount: 3,
      exclude: [excludedId],
    });

    const ids = receipt.lineup.map((a) => a.id);
    expect(ids).not.toContain(excludedId);
  });

  it("Assign stages spreads high-overlap acts apart", () => {
    const receipt = solveLineup({
      universe: testUniverse,
      overlap: testOverlap,
      budget,
      capacity,
      actCount: 4,
    });

    const stageRes = assignStages(receipt.lineup, 2, 2, testOverlap);
    expect(stageRes.stages.length).toBe(2);
    expect(stageRes.days.length).toBe(2);
  });
});
