/**
 * Synthetic fixture data for offline testing and fixture transport (QLOO_MODE=fixture).
 * Invariant 4: No real Qloo response data is stored here. All records are hand-authored
 * synthetic mocks modeled after the documented schema.
 */

export interface SyntheticArtist {
  id: string;
  name: string;
  type: string;
  popularity: number;
  genres: string[];
  neighbors: Array<{
    id: string;
    name: string;
    affinity: number; // Cosine similarity in embedding space [0, 1]
    popularity: number;
    genres: string[];
  }>;
}

export const SYNTHETIC_PHOEBE_BRIDGERS: SyntheticArtist = {
  id: "urn:entity:artist:synthetic-phoebe-bridgers",
  name: "Phoebe Bridgers",
  type: "urn:entity:artist",
  popularity: 0.82,
  genres: ["indie rock", "folk rock", "indie pop"],
  neighbors: [
    {
      id: "urn:entity:artist:synthetic-boygenius",
      name: "boygenius",
      affinity: 0.89,
      popularity: 0.78,
      genres: ["indie rock", "folk rock"],
    },
    {
      id: "urn:entity:artist:synthetic-lucy-dacus",
      name: "Lucy Dacus",
      affinity: 0.82,
      popularity: 0.70,
      genres: ["indie rock", "indie pop"],
    },
    {
      id: "urn:entity:artist:synthetic-julien-baker",
      name: "Julien Baker",
      affinity: 0.77,
      popularity: 0.67,
      genres: ["indie rock", "alternative"],
    },
  ],
};

export const SYNTHETIC_ARTISTS_CATALOG: Record<string, SyntheticArtist> = {
  "phoebe bridgers": SYNTHETIC_PHOEBE_BRIDGERS,
  [SYNTHETIC_PHOEBE_BRIDGERS.id]: SYNTHETIC_PHOEBE_BRIDGERS,
};
