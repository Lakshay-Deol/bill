import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as exportHandler } from "@/app/api/export/route";
import { POST as scenarioPostHandler, GET as scenarioGetHandler } from "@/app/api/scenarios/route";

describe("API Routes - Export & Storage", () => {
  const mockReceipt = {
    lineup: [
      {
        id: "art-1",
        name: "Test Artist 1",
        popularity: 0.8,
        genres: ["indie"],
        isLocal: false,
        fee: 65000,
        modeledReach: 3500,
        marginalUnique: 3500,
        closestActOverlap: 0,
        stage: 1,
        slotOrder: 1,
      },
    ],
    totalSpent: 65000,
    remainingBudget: 185000,
    modeledUniqueDemand: 3500,
    avgTasteOverlap: 0,
    maxTasteOverlap: 0,
    fansPerDollar: 0.0538,
    upliftPercent: 20.5,
  };

  it("export route exports formatted CSV with headers and receipts", async () => {
    const req = new NextRequest("http://localhost:3000/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", receipt: mockReceipt }),
    });

    const res = await exportHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Stage,Slot Order,Artist Name,Est. Talent Fee ($)");
    expect(text).toContain("Test Artist 1");
    expect(text).toContain("est. $65,000");
    expect(text).toContain("modeled 3500");
  });

  it("export route exports labeled JSON with modeled and est. metadata", async () => {
    const req = new NextRequest("http://localhost:3000/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "json", receipt: mockReceipt }),
    });

    const res = await exportHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.product).toBe("Crowdfolio");
    expect(json.totalSpent.label).toBe("est.");
    expect(json.modeledUniqueDemand.label).toBe("modeled");
  });

  it("scenarios route saves and retrieves named scenario", async () => {
    const postReq = new NextRequest("http://localhost:3000/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Austin Indie Festival 2026",
        market: "Austin",
        budget: 300000,
        capacity: 6000,
        actCount: 8,
        seeds: ["Phoebe Bridgers"],
      }),
    });

    const postRes = await scenarioPostHandler(postReq);
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.id).toMatch(/^sc_/);

    const getReq = new NextRequest(`http://localhost:3000/api/scenarios?id=${postJson.id}`);
    const getRes = await scenarioGetHandler(getReq);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.scenario.name).toBe("Austin Indie Festival 2026");
    expect(getJson.scenario.budget).toBe(300000);
  });
});

