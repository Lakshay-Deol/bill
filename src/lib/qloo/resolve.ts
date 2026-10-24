import { qlooGet, QlooEmptyResultError } from "./client";
import { QlooSearchResponseSchema, QlooSearchEntity } from "./schemas";
import { getCached, setCached } from "./cache";

export interface ResolvedArtist {
  id: string;
  name: string;
  popularity: number;
  imageUrl?: string;
  shortDescription?: string;
  disambiguation?: string;
}

export interface DisambiguationCandidate {
  id: string;
  name: string;
  disambiguation?: string;
  popularity?: number;
}

export interface ArtistResolutionResult {
  primary: ResolvedArtist;
  disambiguationList: DisambiguationCandidate[];
}

function normalizeSearchCandidate(entity: QlooSearchEntity): ResolvedArtist {
  return {
    id: entity.entity_id ?? entity.id ?? "",
    name: entity.name,
    popularity: entity.popularity ?? 0.5,
    imageUrl: entity.properties?.image?.url,
    shortDescription: entity.properties?.short_description,
    disambiguation: entity.disambiguation,
  };
}

export async function resolveArtist(name: string): Promise<ArtistResolutionResult> {
  const normName = name.trim().toLowerCase();
  const cacheKey = `resolve:${encodeURIComponent(normName)}`;

  const cached = await getCached<ArtistResolutionResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await qlooGet(
    "/search",
    {
      query: name.trim(),
      types: "urn:entity:artist",
      take: 5,
    },
    QlooSearchResponseSchema
  );

  const candidates = data.results ?? data.entities ?? [];
  if (candidates.length === 0) {
    throw new QlooEmptyResultError(`/search?query=${encodeURIComponent(name)}`);
  }

  const primaryRaw = candidates[0];
  if (!primaryRaw) {
    throw new QlooEmptyResultError(`/search?query=${encodeURIComponent(name)}`);
  }

  const primary = normalizeSearchCandidate(primaryRaw);
  const disambiguationList: DisambiguationCandidate[] = candidates.slice(1).map((c) => ({
    id: c.entity_id ?? c.id ?? "",
    name: c.name,
    disambiguation: c.disambiguation,
    popularity: c.popularity,
  }));

  const result: ArtistResolutionResult = {
    primary,
    disambiguationList,
  };

  await setCached(cacheKey, result, 86400 * 30); // Cache 30 days
  return result;
}
