import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveArtist } from "@/lib/qloo/resolve";
import { buildUniverseAndMatrix } from "@/lib/qloo/matrix";
import { solveLineup, SolverCandidate } from "@/lib/solver";

const SolveRequestSchema = z.object({
  market: z.string().default("Austin"),
  budget: z.number().min(10000).max(10000000).default(250000),
  capacity: z.number().min(500).max(150000).default(5000),
  actCount: z.number().min(2).max(30).default(8),
  seeds: z.array(z.string()).default(["Phoebe Bridgers", "boygenius", "Lucy Dacus"]),
  requireLocal: z.boolean().default(false),
  mustInclude: z.array(z.string()).default([]),
  maxPerGenre: z.record(z.number()).default({}),
  feeOverrides: z.record(z.number()).default({}),
});

/**
 * Invariant 3: src/lib/qloo/client.ts is the only network exit.
 * This is the only API route in the application.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = SolveRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const {
      market,
      budget,
      capacity,
      actCount,
      seeds,
      requireLocal,
      mustInclude,
      maxPerGenre,
      feeOverrides,
    } = parseResult.data;

    // Resolve seed entity IDs
    const seedIds: string[] = [];
    for (const seed of seeds) {
      try {
        const res = await resolveArtist(seed);
        seedIds.push(res.primary.id);
      } catch (err) {
        console.warn(`[Solve API] Could not resolve seed "${seed}":`, err);
      }
    }

    if (seedIds.length === 0) {
      return NextResponse.json(
        { error: "Could not resolve any seed artist entities in Qloo taste graph" },
        { status: 422 }
      );
    }

    // Build candidate universe and pairwise taste overlap matrix
    const { candidates, overlap } = await buildUniverseAndMatrix({
      seeds: seedIds,
      market,
      budget,
    });

    // Map candidate entities to solver input format
    const isMarketLocal = (genres: string[], name: string) => {
      const lowerMarket = market.toLowerCase();
      return (
        genres.some((g) => g.toLowerCase().includes(lowerMarket)) ||
        genres.some((g) => g.toLowerCase().includes("local"))
      );
    };

    const solverUniverse: SolverCandidate[] = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      popularity: c.popularity,
      genres: c.genres,
      imageUrl: c.imageUrl,
      isLocal: isMarketLocal(c.genres, c.name),
      feeOverride: feeOverrides[c.id],
    }));

    // Execute pure deterministic optimization
    const receipt = solveLineup({
      universe: solverUniverse,
      overlap,
      budget,
      capacity,
      actCount,
      requireLocal,
      mustInclude,
      maxPerGenre,
      stageCount: 2,
    });

    return NextResponse.json(receipt);
  } catch (err: unknown) {
    console.error("[Solve API Route Fatal Error]:", err);
    return NextResponse.json(
      {
        error: "Solve failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
