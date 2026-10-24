import pLimit from "p-limit";
import { qlooGet } from "./client";
import { QlooInsightsResponseSchema, QlooInsightEntity } from "./schemas";
import { getCached, setCached } from "./cache";

export interface CandidateArtist {
  id: string;
  name: string;
  popularity: number;
  imageUrl?: string;
  genres: string[];
  neighbors: Record<string, number>; // neighbor_id -> affinity score [0, 1]
  isEnriched: boolean;
}

export interface UniverseBuildOptions {
  seeds: string[]; // artist IDs or names
  market?: string;
  budget?: number;
  universeCap?: number;
  enrichCap?: number;
}

export interface TasteMatrixResult {
  candidates: CandidateArtist[];
  overlap: Record<string, Record<string, number>>; // actA_id -> actB_id -> tasteOverlap [0, 1]
  callStats: {
    totalCalls: number;
    cacheHits: number;
    wallTimeMs: number;
  };
}

const callConcurrency = pLimit(6);

/**
 * Retrieves neighbor set for an artist, cached in Redis/memory.
 */
export async function getArtistNeighborSet(
  entityId: string,
  market?: string
): Promise<{
  neighborsMap: Record<string, number>;
  rawEntities: QlooInsightEntity[];
  cacheHit: boolean;
}> {
  const cacheKey = `neighbors:${entityId}:${market ?? "global"}`;
  const cached = await getCached<{
    neighborsMap: Record<string, number>;
    rawEntities: QlooInsightEntity[];
  }>(cacheKey);

  if (cached) {
    return { ...cached, cacheHit: true };
  }

  const startTime = Date.now();
  const data = await qlooGet(
    "/v2/insights",
    {
      "filter.type": "urn:entity:artist",
      "signal.interests.entities": entityId,
      "filter.location.query": market,
      take: 50,
      "feature.explainability": false,
    },
    QlooInsightsResponseSchema
  );
  const elapsed = Date.now() - startTime;
  console.log(`[Qloo API] /v2/insights for ${entityId} completed in ${elapsed}ms`);

  const rawResults = data.results;
  const rawList = Array.isArray(rawResults)
    ? rawResults
    : rawResults?.entities ?? data.entities ?? [];

  const neighborsMap: Record<string, number> = {};
  for (const n of rawList) {
    const id = n.entity_id ?? n.id;
    if (id) {
      const affinity = n.query?.affinity ?? n.affinity ?? 0.5;
      neighborsMap[id] = affinity;
    }
  }

  const result = { neighborsMap, rawEntities: rawList };
  await setCached(cacheKey, result, 86400 * 7); // Cache 7 days
  return { ...result, cacheHit: false };
}

/**
 * Computes cosine similarity between two affinity vectors.
 * Invariant 6: It is tasteOverlap, never "audience overlap".
 */
export function computeTasteOverlap(
  vecA: Record<string, number>,
  vecB: Record<string, number>,
  directAffinityAB?: number,
  directAffinityBA?: number
): number {
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);

  // If both have vectors, compute cosine similarity over common keys
  if (keysA.length > 0 && keysB.length > 0) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const val of Object.values(vecA)) {
      normA += val * val;
    }
    for (const val of Object.values(vecB)) {
      normB += val * val;
    }

    if (normA === 0 || normB === 0) return 0;

    for (const key of keysA) {
      const valB = vecB[key];
      if (valB !== undefined) {
        dotProduct += (vecA[key] ?? 0) * valB;
      }
    }

    const cosine = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, Number(cosine.toFixed(4))));
  }

  // Fallback to direct pairwise affinity if vectors are not both available
  const direct = directAffinityAB ?? directAffinityBA;
  if (direct !== undefined) {
    return Math.max(0, Math.min(1, Number(direct.toFixed(4))));
  }

  return 0;
}

/**
 * Builds the candidate universe and N x N taste overlap matrix.
 */
export async function buildUniverseAndMatrix(
  options: UniverseBuildOptions
): Promise<TasteMatrixResult> {
  const startTotal = Date.now();
  let totalCalls = 0;
  let cacheHits = 0;

  const universeCap = options.universeCap ?? 120;
  const enrichCap = options.enrichCap ?? 40;

  const candidateMap = new Map<string, CandidateArtist>();

  // 1. Fetch neighbor sets for seed headliners
  const seedPromises = options.seeds.map((seedId) =>
    callConcurrency(async () => {
      totalCalls++;
      const res = await getArtistNeighborSet(seedId, options.market);
      if (res.cacheHit) cacheHits++;
      return { seedId, res };
    })
  );

  const seedResults = await Promise.all(seedPromises);

  // Collect seed candidates and their neighbors
  for (const { seedId, res } of seedResults) {
    const safeId = String(seedId || "");
    if (!candidateMap.has(safeId)) {
      candidateMap.set(safeId, {
        id: safeId,
        name: `Seed ${safeId.slice(0, 8)}`,
        popularity: 0.8,
        genres: [],
        neighbors: res.neighborsMap,
        isEnriched: true,
      });
    }

    for (const raw of res.rawEntities) {
      const id = raw.entity_id ?? raw.id;
      if (!id) continue;

      if (!candidateMap.has(id)) {
        const genres = [
          ...(raw.properties?.primary_genres ?? []),
          ...(raw.properties?.secondary_genres ?? []),
        ];
        candidateMap.set(id, {
          id,
          name: raw.name,
          popularity: raw.popularity ?? 0.5,
          imageUrl: raw.properties?.image?.url,
          genres,
          neighbors: {},
          isEnriched: false,
        });
      }
    }
  }

  // Deduplicate and cap universe
  const allCandidates = Array.from(candidateMap.values());
  // Sort deterministically by popularity descending, tie-breaking by entityId
  allCandidates.sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity;
    }
    return a.id.localeCompare(b.id);
  });

  const cappedUniverse = allCandidates.slice(0, universeCap);

  // Enrich top candidates with full neighbor sets
  const toEnrich = cappedUniverse.slice(0, enrichCap);
  const enrichPromises = toEnrich.map((candidate) =>
    callConcurrency(async () => {
      if (Object.keys(candidate.neighbors).length > 0) {
        return; // Already has neighbor set from seed stage
      }
      totalCalls++;
      const res = await getArtistNeighborSet(candidate.id, options.market);
      if (res.cacheHit) cacheHits++;
      candidate.neighbors = res.neighborsMap;
      candidate.isEnriched = true;
    })
  );

  await Promise.all(enrichPromises);

  // Compute pairwise taste overlap matrix
  const overlap: Record<string, Record<string, number>> = {};
  for (const actA of cappedUniverse) {
    overlap[actA.id] = {};
  }

  for (let i = 0; i < cappedUniverse.length; i++) {
    const actA = cappedUniverse[i]!;
    overlap[actA.id]![actA.id] = 1.0;

    for (let j = i + 1; j < cappedUniverse.length; j++) {
      const actB = cappedUniverse[j]!;
      const directAB = actA.neighbors[actB.id];
      const directBA = actB.neighbors[actA.id];

      const score = computeTasteOverlap(actA.neighbors, actB.neighbors, directAB, directBA);

      overlap[actA.id]![actB.id] = score;
      overlap[actB.id]![actA.id] = score;
    }
  }

  const wallTimeMs = Date.now() - startTotal;

  return {
    candidates: cappedUniverse,
    overlap,
    callStats: {
      totalCalls,
      cacheHits,
      wallTimeMs,
    },
  };
}
