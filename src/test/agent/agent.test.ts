import { describe, it, expect } from "vitest";
import { parseConstraintEdit } from "@/lib/agent/parse";
import { groundNarration } from "@/lib/agent/ground";

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

  it("parses combined brief adjustments", async () => {
    const combined = await parseConstraintEdit("cut budget to $200k, 6 acts, and add a local opener");
    expect(combined.budget).toBe(200000);
    expect(combined.actCount).toBe(6);
    expect(combined.requireLocal).toBe(true);
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
