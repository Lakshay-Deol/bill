import { z } from "zod";

/**
 * Phase 0 initial schemas inferred from Qloo API documentation prose.
 * PER INVARIANT & PHASE 0 SPEC:
 * Every field is marked UNVERIFIED pending verification against real payloads in Phase 1.
 * These will be rewritten against docs/payloads/ in Phase 1.
 */

// Search endpoint: GET /search?query=<name>&types=urn:entity:artist&take=5
export const QlooSearchEntitySchema = z.object({
  id: z.string(), // UNVERIFIED: entity URN e.g. urn:entity:artist:...
  name: z.string(), // UNVERIFIED: display name of the artist
  type: z.string().optional(), // UNVERIFIED: entity type urn
  images: z.array(z.string()).optional(), // UNVERIFIED: image URLs
  description: z.string().optional(), // UNVERIFIED: short bio or summary
  popularity: z.number().optional(), // UNVERIFIED: popularity score if returned in search
  disambiguation: z.string().optional(), // UNVERIFIED: country or disambiguation string
});

export const QlooSearchResponseSchema = z.object({
  success: z.boolean().optional(), // UNVERIFIED: wrapper status flag
  results: z.array(QlooSearchEntitySchema).optional(), // UNVERIFIED: results array
  entities: z.array(QlooSearchEntitySchema).optional(), // UNVERIFIED: alternate entities array
});

// Insights endpoint: GET /v2/insights?filter.type=urn:entity:artist&signal.interests.entities=<id>&take=50
export const QlooInsightQuerySchema = z.object({
  affinity: z.number().optional(), // UNVERIFIED: cosine similarity score [0, 1]
  popularity: z.number().optional(), // UNVERIFIED: query-level popularity
  explainability: z.record(z.unknown()).optional(), // UNVERIFIED: attribution / explainability map
});

export const QlooInsightPropertiesSchema = z.object({
  popularity: z.number().optional(), // UNVERIFIED: entity popularity score [0, 1]
  genres: z.array(z.string()).optional(), // UNVERIFIED: genre tags array
  akas: z.array(z.string()).optional(), // UNVERIFIED: alternate names
});

export const QlooInsightEntitySchema = z.object({
  id: z.string(), // UNVERIFIED: entity URN
  name: z.string(), // UNVERIFIED: artist name
  type: z.string().optional(), // UNVERIFIED: entity type urn
  affinity: z.number().optional(), // UNVERIFIED: direct affinity score if at top level
  query: QlooInsightQuerySchema.optional(), // UNVERIFIED: nested query metadata
  properties: QlooInsightPropertiesSchema.optional(), // UNVERIFIED: nested properties
});

export const QlooInsightsResponseSchema = z.object({
  success: z.boolean().optional(), // UNVERIFIED: success status
  entities: z.array(QlooInsightEntitySchema).optional(), // UNVERIFIED: primary entities array
  results: z.array(QlooInsightEntitySchema).optional(), // UNVERIFIED: alternate results array
});

export type QlooSearchEntity = z.infer<typeof QlooSearchEntitySchema>;
export type QlooSearchResponse = z.infer<typeof QlooSearchResponseSchema>;
export type QlooInsightEntity = z.infer<typeof QlooInsightEntitySchema>;
export type QlooInsightsResponse = z.infer<typeof QlooInsightsResponseSchema>;
