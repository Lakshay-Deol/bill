import { z } from "zod";
import { env } from "@/lib/env";
import {
  SYNTHETIC_ARTISTS_CATALOG,
  SYNTHETIC_PHOEBE_BRIDGERS,
} from "@/lib/fixtures/synthetic-artists";
import {
  QlooSearchResponseSchema,
  QlooInsightsResponseSchema,
} from "./schemas";

// --- Typed Error Taxonomy ---

export class QlooError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(`[Qloo Error] ${path}: ${message}`);
    this.name = "QlooError";
  }
}

export class QlooAuthError extends QlooError {
  constructor(path: string, status: number, details: unknown) {
    super("Authentication failed (401). Verify QLOO_BASE_URL and QLOO_API_KEY.", path, status, details);
    this.name = "QlooAuthError";
  }
}

export class QlooForbiddenError extends QlooError {
  constructor(path: string, status: number, details: unknown) {
    super("Access forbidden (403). Unsupported entity type or feature.", path, status, details);
    this.name = "QlooForbiddenError";
  }
}

export class QlooSignalError extends QlooError {
  constructor(path: string, status: number, details: unknown) {
    super("Bad request (400). Missing or invalid signal/filter parameter.", path, status, details);
    this.name = "QlooSignalError";
  }
}

export class QlooEmptyResultError extends QlooError {
  constructor(path: string, details?: unknown) {
    super("Empty result set returned. Entity may be unrecognized or unsupported in this market.", path, 200, details);
    this.name = "QlooEmptyResultError";
  }
}

export class QlooShapeError extends QlooError {
  constructor(path: string, public readonly zodError: z.ZodError, rawPayload: unknown) {
    super("Payload schema validation failed.", path, undefined, { zodError, rawPayload });
    this.name = "QlooShapeError";
  }
}

export class QlooTimeoutError extends QlooError {
  constructor(path: string) {
    super("Request timed out after 15,000ms.", path);
    this.name = "QlooTimeoutError";
  }
}

// --- Query Parameters Type ---

export type QlooQueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

// --- Fixture Transport Handler ---

function handleFixtureTransport<T>(
  path: string,
  params: QlooQueryParams,
  schema: z.ZodType<T>
): T {
  const normPath = path.startsWith("/") ? path : `/${path}`;

  if (normPath === "/search") {
    const query = String(params["query"] ?? "").toLowerCase().trim();
    const match =
      SYNTHETIC_ARTISTS_CATALOG[query] ?? SYNTHETIC_PHOEBE_BRIDGERS;

    const mockResponse = {
      success: true,
      results: [
        {
          id: match.id,
          name: match.name,
          type: match.type,
          popularity: match.popularity,
          disambiguation: "US Indie Rock",
        },
      ],
      entities: [
        {
          id: match.id,
          name: match.name,
          type: match.type,
          popularity: match.popularity,
          disambiguation: "US Indie Rock",
        },
      ],
    };

    const parsed = schema.safeParse(mockResponse);
    if (!parsed.success) {
      throw new QlooShapeError(path, parsed.error, mockResponse);
    }
    return parsed.data;
  }

  if (normPath.startsWith("/v2/insights")) {
    const entitySignal = String(params["signal.interests.entities"] ?? "");
    const match =
      SYNTHETIC_ARTISTS_CATALOG[entitySignal] ?? SYNTHETIC_PHOEBE_BRIDGERS;

    const mockEntities = match.neighbors.map((n) => ({
      id: n.id,
      name: n.name,
      type: "urn:entity:artist",
      affinity: n.affinity,
      query: {
        affinity: n.affinity,
        popularity: n.popularity,
      },
      properties: {
        popularity: n.popularity,
        genres: n.genres,
      },
    }));

    const mockResponse = {
      success: true,
      entities: mockEntities,
      results: mockEntities,
    };

    const parsed = schema.safeParse(mockResponse);
    if (!parsed.success) {
      throw new QlooShapeError(path, parsed.error, mockResponse);
    }
    return parsed.data;
  }

  // Fallback for unknown path in fixture mode
  const genericFallback = { success: true, entities: [], results: [] };
  const parsed = schema.safeParse(genericFallback);
  if (!parsed.success) {
    throw new QlooShapeError(path, parsed.error, genericFallback);
  }
  return parsed.data;
}

// --- Live HTTP Client ---

/**
 * Executes a GET request to the Qloo API.
 * Invariant 3: src/lib/qloo/client.ts is the ONLY file that touches the network.
 */
export async function qlooGet<T>(
  path: string,
  params: QlooQueryParams = {},
  schema: z.ZodType<T>
): Promise<T> {
  // If QLOO_MODE is fixture, return synthetic mock immediately without network
  if (env.QLOO_MODE === "fixture") {
    return handleFixtureTransport(path, params, schema);
  }

  const url = new URL(path, env.QLOO_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Api-Key": env.QLOO_API_KEY ?? "",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new QlooTimeoutError(path);
    }
    throw new QlooError(
      err instanceof Error ? err.message : "Network fetch failed",
      path
    );
  }

  if (!res.ok) {
    const rawText = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new QlooAuthError(path, res.status, rawText);
    }
    if (res.status === 403) {
      throw new QlooForbiddenError(path, res.status, rawText);
    }
    if (res.status === 400) {
      throw new QlooSignalError(path, res.status, rawText);
    }
    throw new QlooError(`HTTP ${res.status}: ${res.statusText}`, path, res.status, rawText);
  }

  const json = await res.json().catch((err) => {
    throw new QlooError(`Failed to parse JSON response: ${err.message}`, path, res.status);
  });

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new QlooShapeError(path, parsed.error, json);
  }

  return parsed.data;
}

/**
 * High-level entity resolution via /search
 */
export async function resolveArtistByName(name: string) {
  const data = await qlooGet(
    "/search",
    {
      query: name,
      types: "urn:entity:artist",
      take: 5,
    },
    QlooSearchResponseSchema
  );

  const candidates = data.results ?? data.entities ?? [];
  if (candidates.length === 0) {
    throw new QlooEmptyResultError(`/search?query=${encodeURIComponent(name)}`);
  }

  const primary = candidates[0];
  if (!primary) {
    throw new QlooEmptyResultError(`/search?query=${encodeURIComponent(name)}`);
  }

  const normalizedPrimary = {
    ...primary,
    id: primary.entity_id ?? primary.id ?? "",
  };

  return {
    artist: normalizedPrimary,
    disambiguationList: candidates.slice(1),
  };
}

/**
 * High-level neighbor set retrieval via /v2/insights
 */
export async function getArtistNeighbors(
  entityId: string,
  options?: { market?: string; take?: number; explainability?: boolean }
) {
  const data = await qlooGet(
    "/v2/insights",
    {
      "filter.type": "urn:entity:artist",
      "signal.interests.entities": entityId,
      "filter.location.query": options?.market,
      take: options?.take ?? 50,
      "feature.explainability": options?.explainability ?? true,
    },
    QlooInsightsResponseSchema
  );

  const rawResults = data.results;
  const rawList = Array.isArray(rawResults)
    ? rawResults
    : rawResults?.entities ?? data.entities ?? [];

  return rawList.map((n) => ({
    ...n,
    id: n.entity_id ?? n.id ?? "",
  }));
}

