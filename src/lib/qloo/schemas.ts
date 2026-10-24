import { z } from "zod";

/**
 * Verified Qloo API schemas proven by real payloads in docs/payloads/.
 * - docs/payloads/search.json
 * - docs/payloads/neighbors-national.json
 */

export const QlooSearchEntitySchema = z.object({
  entity_id: z.string().optional(),
  id: z.string().optional(),
  name: z.string(),
  types: z.array(z.string()).optional(),
  type: z.string().optional(),
  popularity: z.number().optional(),
  disambiguation: z.string().optional(),
  properties: z
    .object({
      image: z.object({ url: z.string().optional() }).optional(),
      short_description: z.string().optional(),
    })
    .passthrough()
    .optional(),
  tags: z.array(z.unknown()).optional(),
});

export const QlooSearchResponseSchema = z.object({
  success: z.boolean().optional(),
  results: z.array(QlooSearchEntitySchema).optional(),
  entities: z.array(QlooSearchEntitySchema).optional(),
});

export const QlooInsightEntitySchema = z.object({
  entity_id: z.string().optional(),
  id: z.string().optional(),
  name: z.string(),
  type: z.string().optional(),
  subtype: z.string().optional(),
  popularity: z.number().optional(),
  affinity: z.number().optional(),
  disambiguation: z.string().optional(),
  query: z
    .object({
      affinity: z.number().optional(),
      popularity: z.number().optional(),
      explainability: z.record(z.unknown()).optional(),
    })
    .passthrough()
    .optional(),
  properties: z
    .object({
      image: z.object({ url: z.string().optional() }).optional(),
      primary_genres: z.array(z.string()).optional(),
      secondary_genres: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
    .passthrough()
    .optional(),
  tags: z.array(z.unknown()).optional(),
});

export const QlooInsightsResponseSchema = z.object({
  success: z.boolean().optional(),
  // Real payload has results as an object containing { entities: [...] }, or directly array
  results: z
    .union([
      z.object({
        entities: z.array(QlooInsightEntitySchema).optional(),
      }),
      z.array(QlooInsightEntitySchema),
    ])
    .optional(),
  entities: z.array(QlooInsightEntitySchema).optional(),
});

export type QlooSearchEntity = z.infer<typeof QlooSearchEntitySchema>;
export type QlooSearchResponse = z.infer<typeof QlooSearchResponseSchema>;
export type QlooInsightEntity = z.infer<typeof QlooInsightEntitySchema>;
export type QlooInsightsResponse = z.infer<typeof QlooInsightsResponseSchema>;
