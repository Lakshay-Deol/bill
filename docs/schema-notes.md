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
| 1 | Does `/v2/insights` return a popularity value per entity? What is the exact key path? | | | If absent, implement the bisection fallback (`IMPLEMENTATION_PLAN.md` §6.4) — 6 calls per shortlisted artist |
| 2 | What is the exact shape of the affinity field — number, or nested object? What is its key path? | | | Changes the matrix builder's parse step |
| 3 | Does `signal.interests.entities` accept an artist ID when `filter.type=urn:entity:artist` (artist→artist)? | | | If not, the entire neighbor-set approach needs a different signal source |
| 4 | Does `filter.location.query` work with `filter.type=urn:entity:artist`? | | | If not, local affinity must come from `signal.location.query` or the heatmap |
| 5 | What fields does `/search` return — id, name, type, image, description, disambiguation info? | | | Determines whether S1 can show images and whether disambiguation is possible |
| 6 | What is the exact shape of `query.explainability` — key names, nesting, score range? | | | Determines the S4 drawer; if absent, the drawer shows "attribution unavailable" |
| 7 | What rate limit applies before a 429? What headers report it? | | | Determines `p-limit` concurrency and backoff |
| 8 | Are `take=50` results stable across repeated identical calls? | | | If not, caching is mandatory for demo reproducibility, and the golden test must freeze one response |

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
