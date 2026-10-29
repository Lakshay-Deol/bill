import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExportRequestSchema = z.object({
  format: z.enum(["json", "csv"]).default("csv"),
  receipt: z.object({
    lineup: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        popularity: z.number(),
        genres: z.array(z.string()).default([]),
        isLocal: z.boolean().default(false),
        fee: z.number(),
        modeledReach: z.number(),
        marginalUnique: z.number(),
        closestActName: z.string().optional(),
        closestActOverlap: z.number().default(0),
        stage: z.number().default(1),
        slotOrder: z.number().default(1),
      })
    ),
    totalSpent: z.number(),
    remainingBudget: z.number(),
    modeledUniqueDemand: z.number(),
    avgTasteOverlap: z.number(),
    maxTasteOverlap: z.number().optional(),
    fansPerDollar: z.number().default(0),
    upliftPercent: z.number().optional(),
  }),
});

function escapeCsv(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ExportRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid export payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { format, receipt } = parseResult.data;

    if (format === "csv") {
      const headers = [
        "Stage",
        "Slot Order",
        "Artist Name",
        "Est. Talent Fee ($)",
        "Modeled Draw Reach",
        "Modeled Marginal Fans",
        "Closest Neighbor Act",
        "Taste Overlap (%)",
        "Local Act",
        "Genres",
      ];

      const rows = receipt.lineup.map((act) => [
        escapeCsv(`Stage ${act.stage}`),
        escapeCsv(act.slotOrder),
        escapeCsv(act.name),
        escapeCsv(`est. $${act.fee.toLocaleString()}`),
        escapeCsv(`modeled ${act.modeledReach}`),
        escapeCsv(`modeled +${act.marginalUnique}`),
        escapeCsv(act.closestActName ?? "None"),
        escapeCsv(`${(act.closestActOverlap * 100).toFixed(1)}%`),
        escapeCsv(act.isLocal ? "Yes" : "No"),
        escapeCsv(act.genres.join("; ")),
      ]);

      // Summary rows at bottom
      rows.push([]);
      rows.push([escapeCsv("SUMMARY METRICS")]);
      rows.push([escapeCsv("Total Talent Spend"), escapeCsv(`est. $${receipt.totalSpent.toLocaleString()}`)]);
      rows.push([escapeCsv("Modeled Unique Demand"), escapeCsv(`modeled ${receipt.modeledUniqueDemand.toLocaleString()} attendees`)]);
      rows.push([escapeCsv("Average Taste Overlap"), escapeCsv(`${(receipt.avgTasteOverlap * 100).toFixed(1)}%`)]);
      if (receipt.maxTasteOverlap !== undefined) {
        rows.push([escapeCsv("Max Taste Overlap"), escapeCsv(`${(receipt.maxTasteOverlap * 100).toFixed(1)}%`)]);
      }
      rows.push([escapeCsv("Fans Per Dollar"), escapeCsv(receipt.fansPerDollar.toFixed(4))]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="crowdfolio-lineup.csv"',
        },
      });
    }

    // JSON export with explicit modeled and est. labels
    const exportJson = {
      product: "Crowdfolio",
      exportTimestamp: new Date().toISOString(),
      disclaimer: "All fees are heuristic estimates marked est.; reach and uplift figures are simulated from Qloo taste graph.",
      totalSpent: { amount: receipt.totalSpent, label: "est." },
      modeledUniqueDemand: { count: receipt.modeledUniqueDemand, label: "modeled" },
      averageTasteOverlap: receipt.avgTasteOverlap,
      maxTasteOverlap: receipt.maxTasteOverlap,
      fansPerDollar: receipt.fansPerDollar,
      upliftPercent: receipt.upliftPercent,
      roster: receipt.lineup.map((act) => ({
        id: act.id,
        name: act.name,
        fee: { amount: act.fee, label: "est." },
        drawReach: { count: act.modeledReach, label: "modeled" },
        marginalUniqueFans: { count: act.marginalUnique, label: "modeled" },
        tasteOverlapWithClosest: act.closestActOverlap,
        closestActName: act.closestActName,
        stage: act.stage,
        slotOrder: act.slotOrder,
        genres: act.genres,
        isLocal: act.isLocal,
      })),
    };

    return new NextResponse(JSON.stringify(exportJson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="crowdfolio-lineup.json"',
      },
    });
  } catch (err) {
    console.error("[Export API Error]:", err);
    return NextResponse.json({ error: "Failed to export lineup" }, { status: 500 });
  }
}

