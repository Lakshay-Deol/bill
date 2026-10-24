import { describe, it, expect } from "vitest";
import { reach } from "@/lib/model/reach";
import { feeEstimate } from "@/lib/model/fee";
import { marginalUnique } from "@/lib/model/score";
import { BETA, GAMMA, FEE_FLOOR_RATIO, FEE_TOP_RATIO } from "@/lib/model/constants";

describe("Model - reach() invariants", () => {
  const CAP = 5000;

  it("reach(0) must equal 0", () => {
    expect(reach(0, CAP)).toBe(0);
  });

  it("reach(1) must equal festival capacity", () => {
    expect(reach(1, CAP)).toBe(CAP);
  });

  it("reach() is strictly monotone increasing in popularity", () => {
    const popularities = [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1.0];
    for (let i = 0; i < popularities.length - 1; i++) {
      const p1 = popularities[i]!;
      const p2 = popularities[i + 1]!;
      const r1 = reach(p1, CAP);
      const r2 = reach(p2, CAP);
      expect(r1).toBeLessThan(r2);
    }
  });

  it("respects superlinear curvature exponent BETA", () => {
    const p = 0.5;
    const expected = Math.round(CAP * Math.pow(p, BETA));
    expect(reach(p, CAP)).toBe(expected);
  });
});

describe("Model - feeEstimate() invariants", () => {
  const BUDGET = 250000;

  it("feeEstimate() is monotone increasing in popularity", () => {
    const popularities = [0.0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1.0];
    for (let i = 0; i < popularities.length - 1; i++) {
      const p1 = popularities[i]!;
      const p2 = popularities[i + 1]!;
      const f1 = feeEstimate(p1, BUDGET);
      const f2 = feeEstimate(p2, BUDGET);
      expect(f1).toBeLessThanOrEqual(f2);
    }
  });

  it("feeEstimate() never exceeds FEE_TOP_RATIO * budget (0.45 * B)", () => {
    const maxFee = feeEstimate(1.0, BUDGET);
    expect(maxFee).toBeLessThanOrEqual(FEE_TOP_RATIO * BUDGET);
    expect(maxFee).toBe(Math.round(FEE_TOP_RATIO * BUDGET));
  });

  it("feeEstimate() never drops below FEE_FLOOR_RATIO * budget (0.02 * B)", () => {
    const minFee = feeEstimate(0.0, BUDGET);
    expect(minFee).toBeGreaterThanOrEqual(FEE_FLOOR_RATIO * BUDGET);
    expect(minFee).toBe(Math.round(FEE_FLOOR_RATIO * BUDGET));
  });

  it("respects superlinear cost exponent GAMMA", () => {
    const p = 0.8;
    const floor = BUDGET * FEE_FLOOR_RATIO;
    const ceiling = BUDGET * FEE_TOP_RATIO;
    const expected = Math.round(floor + (ceiling - floor) * Math.pow(p, GAMMA));
    expect(feeEstimate(p, BUDGET)).toBe(expected);
  });
});

describe("Model - marginalUnique() invariants", () => {
  const CAP = 5000;

  it("returns full reach if no acts are booked yet", () => {
    const act = { id: "act-1", popularity: 0.8 };
    const r = reach(act.popularity, CAP);
    const marginal = marginalUnique(act, [], {}, CAP);
    expect(marginal).toBe(r);
  });

  it("returns 0 marginal if candidate has 1.0 overlap with an already booked act", () => {
    const act = { id: "act-1", popularity: 0.8 };
    const booked = [{ id: "act-2", popularity: 0.8 }];
    const overlap = { "act-1": { "act-2": 1.0 } };
    const marginal = marginalUnique(act, booked, overlap, CAP);
    expect(marginal).toBe(0);
  });

  it("returns full reach if overlap with all booked acts is 0.0", () => {
    const act = { id: "act-1", popularity: 0.8 };
    const booked = [{ id: "act-2", popularity: 0.7 }];
    const overlap = { "act-1": { "act-2": 0.0 } };
    const marginal = marginalUnique(act, booked, overlap, CAP);
    expect(marginal).toBe(reach(act.popularity, CAP));
  });
});
