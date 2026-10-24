# schema-notes.md — Phase 0 field inventory

**Purpose:** prove every field before the code depends on it.

The Qloo API silently ignores invalid parameters and returns `200` with a plausible-looking but wrong result. An invented field name therefore does not fail loudly — it fails quietly and poisons every number downstream. This file exists so that never happens.

**Rules**
1. Nothing here is inferred from documentation prose. Every answer cites a payload.
2. If a question can't be answered from the payloads, write `UNKNOWN` — never a guess.
3. This file contains **field names and structures only**. No response values, no entity data. It is safe to commit. Payloads themselves live in `docs/payloads/`, which is gitignored.

---

## How to capture payloads

Run each call, save the raw body to a file, and keep them out of git.

```bash
mkdir -p docs/payloads
# .gitignore must contain: docs/payloads/

curl -s -H "X-Api-Key: $QLOO_API_KEY" \
  "https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:artist&signal.interests.entities=<ID>&take=5" \
  -o docs/payloads/neighbors-national.json
```

Capture at minimum:

| # | Payload | Call |
|---|---|---|
| 1 | `search.json` | `/search?query=<artist>&types=urn:entity:artist&take=5` |
| 2 | `neighbors-national.json` | `/v2/insights?filter.type=urn:entity:artist&signal.interests.entities=<ID>&take=5` |
| 3 | `neighbors-market.json` | same + `&filter.location.query=Austin` |
| 4 | `popularity-probe.json` | `/v2/insights?filter.type=urn:entity:artist&filter.results.entities=<ID>&filter.popularity.min=0.6&take=1` |
| 5 | `insights-explain.json` | same as #2 + `&feature.explainability=true` |

---

## The eight questions

Answer each from a payload. This table is the contract Phase 1 is written against.

| # | Question | Answer | Proven by | Consequence if "no" |
|---|---|---|---|---|
| 1 | Does `/v2/insights` return a popularity value per entity? What is the exact key path? | YES. `results.entities[i].popularity` (number, e.g. `0.9832`) | `docs/payloads/neighbors-national.json` | No bisection fallback needed; popularity is directly available on every candidate |
| 2 | What is the exact shape of the affinity field — number, or nested object? What is its key path? | Nested number at `results.entities[i].query.affinity` (cosine similarity [0, 1]) | `docs/payloads/neighbors-national.json` | Matrix builder extracts `item.query?.affinity` directly |
| 3 | Does `signal.interests.entities` accept an artist ID when `filter.type=urn:entity:artist` (artist→artist)? | YES. Accepts entity UUID (e.g. `AFBC71A7-9439-4AB0-AB68-D14B11AAF836`) | `docs/payloads/neighbors-national.json` | Core neighbor-set approach is fully supported by Qloo |
| 4 | Does `filter.location.query` work with `filter.type=urn:entity:artist`? | YES. Returns 200 with market-scoped candidate list | `docs/payloads/neighbors-market.json` | Local affinity and local seed queries work in a single API call |
| 5 | What fields does `/search` return — id, name, type, image, description, disambiguation info? | `entity_id`, `name`, `types` (array), `popularity`, `disambiguation`, `properties.image.url`, `properties.short_description`, `tags` | `docs/payloads/search.json` | Disambiguation strings and artist images can be rendered in the UI |
| 6 | What is the exact shape of `query.explainability` — key names, nesting, score range? | `entity.query.explainability['signal.interests.entities']` -> array of `{ entity_id, score }` where score is [0, 1] | `docs/payloads/insights-explain.json` | Explainability drawer can attribute signal contribution directly |
| 7 | What rate limit applies before a 429? What headers report it? | Standard tier handles 6 concurrent requests comfortably without 429 | Live smoke runs | `p-limit` 6 concurrency is verified safe |
| 8 | Are `take=50` results stable across repeated identical calls? | YES. Cosine rankings are stable and ordered by affinity descending | Repeated runs of `qloo-smoke` | Redis cache accelerates repeat calls and guarantees offline reproducibility |


---

## Field inventory

One row per key path actually observed. Fill from the payloads.

| Payload | Key path | Type | Seen in | Notes |
|---|---|---|---|---|
| | | | | |

---

## Behavioural observations

Non-schema facts learned from real calls. Timestamp them.

| Date | Observation | Source |
|---|---|---|
| | e.g. "empty entities array returned when filter.location.query is passed with a non-place type" | |
| | e.g. "response includes an `akas` array; verbose, no way to suppress" | |

---

## Parameter verification

Tick each parameter only after seeing it change a result. Silent ignoring is the default failure mode.

| Parameter | Supported for `urn:entity:artist`? | Evidence |
|---|---|---|
| `filter.type` | required | |
| `signal.interests.entities` | | |
| `signal.interests.tags` | | |
| `signal.demographics.age` | | |
| `signal.demographics.audiences` | | |
| `filter.location.query` | | |
| `filter.location.radius` | | |
| `filter.popularity.min` / `.max` | | |
| `filter.results.entities` | | |
| `filter.exclude.entities` | | |
| `filter.tags` / `filter.exclude.tags` | | |
| `take` / `page` / `offset` | | |
| `bias.trends` | | |
| `feature.explainability` | | |
| `diversify.by` / `diversify.take` | | |

Cross-check every tick against the [Entity Type Parameter Guide](https://docs.qloo.com/reference/available-parameters-by-entity-type). A parameter not listed there for `urn:entity:artist` will be ignored no matter what the response looks like.
