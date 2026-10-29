import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveArtist } from "@/lib/qloo/resolve";
import { buildUniverseAndMatrix } from "@/lib/qloo/matrix";
import { computeEfficientFrontier, SolverCandidate } from "@/lib/solver";

const FrontierRequestSchema = z.object({
  market: z.string().default("Austin"),
  budget: z.number().min(10000).max(10000000).default(250000),
  capacity: z.number().min(500).max(150000).default(5000),
  actCount: z.number().min(2).max(30).default(8),
  seeds: z.array(z.string()).default(["Phoebe Bridgers", "boygenius", "Lucy Dacus"]),
  steps: z.number().min(4).max(24).default(12),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = FrontierRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid frontier request", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { market, budget, capacity, actCount, seeds, steps } = parseResult.data;

    // Resolve seed entity IDs
    const seedIds: string[] = [];
    for (const seed of seeds) {
      try {
        const res = await resolveArtist(seed);
        seedIds.push(res.primary.id);
      } catch (err) {
        console.warn(`[Frontier API] Could not resolve seed "${seed}":`, err);
      }
    }

    if (seedIds.length === 0) {
      return NextResponse.json(
        { error: "Could not resolve seed artists in taste graph" },
        { status: 422 }
      );
    }

    const { candidates, overlap } = await buildUniverseAndMatrix({
      seeds: seedIds,
      market,
      budget,
    });

    const isMarketLocal = (genres: string[], name: string) => {
      const lower = market.toLowerCase();
      return genres.some((g) => g.toLowerCase().includes(lower)) || name.toLowerCase().includes(lower);
    };

    const solverUniverse: SolverCandidate[] = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      popularity: c.popularity,
      genres: c.genres,
      imageUrl: c.imageUrl,
      isLocal: isMarketLocal(c.genres, c.name),
    }));

    const frontier = computeEfficientFrontier(
      {
        universe: solverUniverse,
        overlap,
        budget,
        capacity,
        actCount,
      },
      steps
    );

    return NextResponse.json(frontier);
  } catch (err: unknown) {
    console.error("[Frontier API Route Error]:", err);
    return NextResponse.json(
      {
        error: "Frontier sweep failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const budget = parseInt(url.searchParams.get("budget") || "250000", 10);
  const capacity = parseInt(url.searchParams.get("capacity") || "5000", 10);
  const market = url.searchParams.get("market") || "Austin";

  const fakeReq = new NextRequest(req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget, capacity, market }),
  });

  return POST(fakeReq);
}

