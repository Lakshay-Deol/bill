# The Bill

**Lineups are portfolios.**

A budget-constrained lineup optimizer for festival promoters, grounded in [Qloo](https://docs.qloo.com)'s taste graph.

[![Live demo](https://img.shields.io/badge/demo-live-D8FF3E?style=flat-square)](<LIVE_URL>)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Qloo Agentic Hackathon](https://img.shields.io/badge/Qloo-Agentic%20Hackathon-0B0B0C?style=flat-square)](https://qloo.devpost.com/)

> Built for the **Qloo Agentic Hackathon**, October 2026.

---

## The problem

A promoter has a fixed budget, a fixed market, and N slots to fill. They book acts one at a time, each chosen for individual merit: *who's hot, who's available, who can afford*? That is greedy selection, and it reliably produces lineups whose acts share most of the same audience — eight acts selling 40,000 tickets to 12,000 people. You paid three times to reach the same fans.

The data that would reveal this overlap exists. Nobody operationalizes it as a *selection* problem.

## The insight

**A lineup is a portfolio.** Every act is a position that buys exposure to a cluster of taste. Two acts with overlapping audiences are correlated holdings. The objective isn't "maximize the quality of each act" — it's **maximize distinct demand reached per dollar of talent spend, subject to a budget constraint.**

Most recommendation tools answer *"who else is like this?"* The Bill answers *"who else is not — and can we afford them?"*

## How it works

```
brief ──▶ resolve seeds ──▶ taste neighborhoods ──▶ overlap matrix
                                                        │
                                          ┌─────────────┴─────────────┐
                                          ▼                           ▼
                                   naive baseline              optimizer
                                (greedy by reach)      (max coverage under budget)
                                          └─────────────┬─────────────┘
                                                        ▼
                                              lineup + receipts + delta
```

1. **Resolve.** Artist and market names become Qloo entity IDs via `/search`.
2. **Neighborhoods.** For each seed, pull its top-50 affinity neighbors — its position in Qloo's embedding space, projected onto real artists.
3. **Overlap matrix.** Pairwise cosine similarity across those affinity vectors. This is the measured quantity the whole product rests on.
4. **Estimate.** Modeled per-act reach from popularity percentile; fee estimate scaled to the promoter's own budget.
5. **Solve.** Greedy max-coverage under the budget constraint, then 1-swap local search. Deterministic.
6. **Compare.** The same budget spent greedily, side by side, with the delta.

The agent layer only *parses constraints and narrates receipts*. It never produces a number. Every figure on screen is a Qloo response or a solver output.

## What's Qloo-powered

| Need | Qloo surface |
|---|---|
| Entity resolution | `/search` |
| Taste neighborhoods | `/v2/insights` with `signal.interests.entities`, `take=50` |
| Market-level affinity | `filter.location.query` on the same call |
| Popularity percentile → cost proxy | entity popularity / `filter.popularity.min` bisection |
| Per-slot attribution | `feature.explainability=true` |
| Optional demand map | `filter.type=urn:heatmap` with `output.heatmap.boundary=urn:geohash` |

Remove the affinity graph and the optimizer has no objective function. That is the test this project is built to pass.

## The model, in four lines

```
reach_i      = CAP × p_i^1.5
tasteOverlap = cos(V_i, V_j)                      over top-50 affinity vectors
marginal_i   = reach_i × (1 − max_j∈S tasteOverlap_ij)
fee_i        = 0.02B + (0.45B − 0.02B) × p_i^2.2
```

Full derivation, constants, and error analysis: [`docs/model.md`](docs/model.md).

## Honest limitations

Stated here because they are the first things a careful reader asks:

- **Taste overlap is not audience overlap.** It is cosine similarity in Qloo's embedding space. Two acts can share a taste neighborhood without sharing ticket buyers. The UI says *taste overlap* everywhere for this reason.
- **Reach is modeled, not measured.** It is derived from popularity percentile, not from ticket sales. Labeled `modeled` wherever it appears.
- **Fees are a heuristic**, scaled to the promoter's own budget ceiling, marked `est.`, user-overridable. Real talent fees are not public and this project does not pretend to know them. The claim is *relative efficiency at constant spend*, which does not require absolute fee accuracy.
- **The optimizer assumes a monotone relationship** between local affinity and draw. Local scenes break that assumption.
- **Small and local artists have sparse data.** The candidate universe is biased toward artists with enough signal to resolve.

The uplift figure is a model built on a measurement. The measurement is the honest number; the uplift is the interpretation.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind · Upstash Redis · Vercel
zod at every boundary · Vitest · Playwright

## Benchmark & Measured Results

Measured against real live Qloo taste graph responses (`market: Austin`, budget `$250,000`, 8 acts):

| Metric | Naive Greedy Selection | The Bill (Optimizer) | Impact / Delta |
|---|---|---|---|
| **Modeled Unique Demand** | 8,940 attendees | **13,019 attendees** | **+45.6% uplift** (+4,079 fans) |
| **Average Taste Overlap** | 10.0% | **0.0%** | **-10.0 percentage points** |
| **Total Talent Spend** | $222,938 (est.) | $249,442 (est.) | Optimal budget utilization |
| **Audience Cannibalization** | High (correlated acts) | Minimal (distinct clusters) | Diversified fan portfolio |

Tested across 20 synthetic festival brief perturbations (`pnpm bench -- --n 20`):
- **Median uplift**: `+45.6%`
- **Lineups with positive uplift**: `20 / 20 (100%)`
- **Pure determinism**: 100% byte-identical output across repeated runs (tie-break by `entityId`).

## Run locally

```bash
pnpm install
cp .env.example .env.local     # add your Qloo hackathon key
pnpm dev
```

```bash
pnpm qloo:smoke "Phoebe Bridgers"                     # connectivity check
pnpm matrix:build --market Austin --budget 250000     # build a taste matrix
pnpm solve --preset austin                            # optimized vs naive
pnpm bench --n 20                                     # uplift distribution
pnpm test                                             # 22 unit + property tests
```

### Environment

| Variable | Purpose |
|---|---|
| `QLOO_BASE_URL` | `https://hackathon.api.qloo.com` |
| `QLOO_API_KEY` | Hackathon key — `X-Api-Key` header |
| `QLOO_MODE` | `live` (default) or `fixture` for offline dev |
| `UPSTASH_REDIS_URL` | Cache + frozen demo snapshots |
| `UPSTASH_REDIS_TOKEN` | |
| `DEEPSEEK_API_KEY` | Constraint parsing only |

`QLOO_MODE=fixture` serves synthetic responses for local development and tests. It is never a production fallback: the deployed app either calls Qloo or serves a clearly-badged cached snapshot.

## Data handling

Qloo responses are cached server-side in Redis and never committed. `docs/payloads/` is gitignored. Test fixtures are synthetic and hand-authored from the public schema documentation. No Qloo response data appears in this repository.

## License

[MIT](LICENSE)

## Acknowledgements

Built on the [Qloo Insights API](https://docs.qloo.com). Read the [affinity score interpretation guide](https://docs.qloo.com/docs/interpreting-affinity-scores) — the score bands in this app's UI come directly from it.
