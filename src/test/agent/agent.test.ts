import { describe, it, expect } from "vitest";
import { parseConstraintEdit } from "@/lib/agent/parse";
import { groundNarration } from "@/lib/agent/ground";
import { createSolverAgent } from "@/lib/agent/tools";
import { SYNTHETIC_PHOEBE_BRIDGERS } from "@/lib/fixtures/synthetic-artists";

describe("Agent Layer - Constraint Parsing", () => {
  it("parses budget cuts and increases", async () => {
    const cut = await parseConstraintEdit("cut budget to $180k");
    expect(cut.budget).toBe(180000);

    const increase = await parseConstraintEdit("increase budget to $350,000");
    expect(increase.budget).toBe(350000);
  });

  it("parses local act requirement", async () => {
    const local = await parseConstraintEdit("make sure we have a local Austin opener");
    expect(local.requireLocal).toBe(true);
  });

  it("parses act count adjustments", async () => {
    const acts = await parseConstraintEdit("reduce lineup to 6 acts");
    expect(acts.actCount).toBe(6);
  });

  it("parses lock and exclude constraints", async () => {
    const lock = await parseConstraintEdit("lock Mitski into the lineup");
    expect(lock.mustInclude).toContain("Mitski");

    const exclude = await parseConstraintEdit("exclude boygenius and remove Lucy Dacus");
    expect(exclude.exclude).toContain("boygenius");
  });

  it("parses minimum local acts and genre caps", async () => {
    const minLocal = await parseConstraintEdit("we need at least 2 local acts");
    expect(minLocal.minLocalActs).toBe(2);
    expect(minLocal.requireLocal).toBe(true);

    const genre = await parseConstraintEdit("cap indie at 2");
    expect(genre.maxPerGenre).toEqual({ indie: 2 });
  });

  it("parses combined brief adjustments", async () => {
    const combined = await parseConstraintEdit("cut budget to $200k, 6 acts, and add a local opener");
    expect(combined.budget).toBe(200000);
    expect(combined.actCount).toBe(6);
    expect(combined.requireLocal).toBe(true);
  });
});

describe("Agent Layer - Solver Tools and Grounding", () => {
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
  ];

  const testOverlap: Record<string, Record<string, number>> = {
    [SYNTHETIC_PHOEBE_BRIDGERS.id]: {
      "urn:entity:artist:synthetic-boygenius": 0.89,
      "urn:entity:artist:synthetic-lucy-dacus": 0.82,
    },
  };

  it("agent tool: lock updates lineup and produces grounded narration", () => {
    const agent = createSolverAgent({
      universe: testUniverse,
      overlap: testOverlap,
      budget: 150000,
      capacity: 4000,
      actCount: 3,
    });

    const res = agent.lock("urn:entity:artist:synthetic-boygenius");
    expect(res.tool).toBe("lock");
    expect(res.output.actId).toBe("urn:entity:artist:synthetic-boygenius");
    expect(res.narration).toContain("Locked");
  });

  it("agent tool: compare produces valid delta without ungrounded figures", () => {
    const agent = createSolverAgent({
      universe: testUniverse,
      overlap: testOverlap,
      budget: 150000,
      capacity: 4000,
      actCount: 3,
    });

    const res = agent.compare();
    expect(res.tool).toBe("compare");
    expect(res.output.optimizedDemand).toBeDefined();
    expect(res.output.naiveDemand).toBeDefined();
  });
});

describe("Agent Layer - Invariant 1 Grounding (No Hallucinated Numerals)", () => {
  const mockReceipt = {
    totalSpent: 249442,
    modeledUniqueDemand: 13019,
    avgTasteOverlap: 0.05,
    upliftPercent: 45.6,
  };

  it("allows cited numbers present in the LineupReceipt", () => {
    const text = "We achieved 13019 unique attendees with 45.6% uplift and spent 249442 dollars.";
    const grounded = groundNarration(text, mockReceipt);
    expect(grounded.isGrounded).toBe(true);
  });

  it("flags or filters numerals not grounded in the LineupReceipt", () => {
    const hallucinated = "We expect 99999 attendees and 88888 revenue.";
    const grounded = groundNarration(hallucinated, mockReceipt);
    expect(grounded.isGrounded).toBe(false);
    expect(grounded.unverifiedNumerals).toContain("99999");
    expect(grounded.unverifiedNumerals).toContain("88888");
  });
});
