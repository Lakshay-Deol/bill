import { describe, it, expect } from "vitest";
import { solveLineup, solveNaiveBaseline } from "@/lib/solver";
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
});
