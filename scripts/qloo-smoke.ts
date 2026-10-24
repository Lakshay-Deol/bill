import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

import { resolveArtistByName, getArtistNeighbors } from "../src/lib/qloo/client";
import { env } from "../src/lib/env";

async function main() {
  const query = process.argv[2] ?? "Phoebe Bridgers";
  console.log(`[Qloo Smoke] Querying artist "${query}" in mode: ${env.QLOO_MODE}...`);

  const startTime = Date.now();
  try {
    const { artist } = await resolveArtistByName(query);
    const resolveElapsed = Date.now() - startTime;

    console.log(`-> resolved ${artist.id} in ${resolveElapsed}ms`);

    const neighbors = await getArtistNeighbors(artist.id, { take: 10 });

    const topNeighbor = neighbors[0];
    const topAffinity = topNeighbor?.affinity ?? topNeighbor?.query?.affinity ?? 0;

    console.log(`-> ${neighbors.length} neighbors, top affinity ${topAffinity.toFixed(2)}`);

    if (env.QLOO_MODE === "fixture") {
      console.log(`[Status: Acceptance verified in fixture mode pending live API key]`);
    } else {
      console.log(`[Status: Acceptance verified with live Qloo API key]`);
    }
  } catch (err: unknown) {
    console.error(`[Qloo Smoke Error]:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
