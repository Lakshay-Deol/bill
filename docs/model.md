# The model

Citable description of how The Bill turns a taste graph into a lineup. Constants referenced here live in `src/lib/model/constants.ts` with rationale comments; if this document and the code disagree, the code is wrong.

---

## Notation

| Symbol | Meaning |
|---|---|
| `B` | Talent budget (promoter input, currency) |
| `CAP` | Festival capacity (attendees) |
| `N` | Number of acts to book |
| `U` | Candidate universe, `|U| ≤ 120` |
| `S ⊆ U` | A selected lineup |
| `p_i ∈ [0,1]` | Popularity percentile of act `i` |
| `V_i` | Affinity vector for act `i`: top-50 neighbors → affinity score |
| `O_ij ∈ [0,1]` | Taste overlap between acts `i` and `j` |

---

## 1. Modeled reach

```
reach_i = CAP · p_i^β ,  β = 1.5
```

The number of distinct people who would consider attending *because of* act `i`.

**Why superlinear.** A 90th-percentile act draws disproportionately more than a 45th-percentile act — the tail of live music demand is heavy. β=1.5 is a deliberate compression: β=1 would make reach linear in popularity (too flat at the top), β=2 would make mid-tier acts nearly worthless (too steep in the middle where most festivals actually book).

**Why anchored to `CAP`.** Reach must be interpretable against the promoter's own event. Anchoring means the number reads as "this act alone could fill 85% of the field," which is the sentence a promoter actually says.

**Property.** `reach(0) = 0`; monotone increasing in `p_i`. Both are asserted in `src/test/model/reach.test.ts`.

---

## 2. Taste overlap

```
O_ij = cos(V_i, V_j) = Σ_k v_ik·v_jk / (‖V_i‖·‖V_j‖)
```

computed over the union of both top-50 neighborhoods, with `v_ik = 0` for absent neighbors, then clamped to `[0,1]`.

**What it measures.** Cosine similarity between two positions in Qloo's shared embedding space, projected onto real entities. It is a **taste** relationship, not a measured intersection of ticket buyers. This distinction is load-bearing and is why the code and UI say `tasteOverlap` and never `audienceOverlap`.

**Why cosine over Jaccard.** Jaccard over neighbor *membership* discards magnitude — two acts that both list the same 40 artists, at 0.9 and at 0.3, would score identically. Cosine preserves the strength of the shared affinity.

**Reference scale** (from Qloo's [affinity interpretation guide](https://docs.qloo.com/docs/interpreting-affinity-scores)): >0.8 very high, 0.6–0.8 high, 0.5 medium, <0.5 low. The UI's bar colours use these bands.

---

## 3. Marginal unique demand

```
m_i(S) = reach_i · (1 − max_{j∈S} O_ij)^α ,  α = 1.0
D(S)   = Σ_{i∈S} m_i(S)
```

A new act adds its reach less the share of audience it shares with its **closest already-booked neighbour**.

**Why max, not sum.** Summing pairwise overlaps double-counts and can drive the marginal negative. The max form is a conservative union approximation: it asks "how much of this act's audience is already covered by the nearest thing we've booked?"

**Direction of error — stated plainly.** This approximation is **optimistic under diffuse overlap.** If an act overlaps 0.35 with five selected acts in different sub-genres, no single `max` captures the compounding, and `m_i` overstates the true marginal. The model therefore tends to *overstate* unique demand for acts that are broadly but weakly similar to the rest of the lineup. `D(S)` is a comparative instrument — its value is in ranking two lineups built the same way, not in predicting a gate count.

**Subtle consequence.** Because `m_i` depends on `S`, the objective is not simply additive, which is why the solver recomputes marginals at each step rather than sorting once.

---

## 4. Fee estimate

```
fee_i = FLOOR + (0.45·B − FLOOR) · p_i^γ
FLOOR = 0.02·B ,  γ = 2.2
```

**Why self-scaling.** Absolute talent fees are not public data. Anchoring the curve to the promoter's own budget means the model never claims to know what an act costs — only how the promoter's money is distributed across tiers. The top act can consume at most 45% of budget; the cheapest act is 2%.

**Why γ = 2.2 > β = 1.5.** Fees rise faster than draw at the top of the market. Headliners command a premium that is not proportional to attendance lift — this is the economic fact that makes lineup optimization interesting in the first place.

**Accuracy.** ±40%, and every rendering carries `est.`. The user can override any fee. The product's claim — relative efficiency at constant budget — requires only that `fee` be monotone in popularity, not accurate in absolute terms.

**Worked example**, `B = $250,000`:

| `p_i` | `fee_i` |
|---|---|
| 0.30 | $17.8k |
| 0.50 | $28.4k |
| 0.80 | $66.5k |
| 0.95 | $99.0k |

---

## 5. Selection value

```
value_i = m_i(S) / fee_i
```

Modeled unique fans per dollar. This is the greedy ranking key, and the number that appears on each slot card as `+N unique`.

---

## 6. The optimization problem

```
maximize    D(S)
subject to  Σ_{i∈S} fee_i ≤ B
            |S| = N
            count(genre g ∈ S) ≤ cap_g     ∀g
            local ∈ S                       (if required)
            mustInclude ⊆ S
```

Max-coverage with a knapsack constraint: NP-hard in general.

**Greedy** — the standard `(1 − 1/e)` approximation for monotone submodular maximization. At each step, take the feasible candidate with the highest `value_i`, recomputing marginals. Tie-break: lower fee, then `entityId` ascending.

**Local search** — 1-swap hill climbing, ≤200 iterations. For each selected act `i` and unselected `j`, apply the swap if it keeps budget and constraints and improves `D(S)`. This recovers most of the gap between greedy and optimal, because greedy cannot see that dropping an early pick unlocks two better ones.

**Determinism** is an invariant, not an accident: no clock, no randomness, explicit comparators everywhere, tie-breaks on `entityId`. The same brief must produce a byte-identical receipt so that the demo is reproducible and the golden test can assert.

**Complexity.** Greedy ≈ `O(N·|U|)`; local search ≈ `O(200·N·|U|)` ≈ 288k operations worst case — under 50ms. The network is always the bottleneck, never the solver.

---

## 7. The naive baseline

```
Naive(B, N): sort U by reach desc; take greedily while budget holds
```

This is a faithful simulation of how a promoter books: the biggest act they can afford, then the next biggest. It is the honest strawman, and the comparison is the product's central claim.

Both lineups are scored with the same `D(S)` function. The comparison is internally consistent by construction.

---

## 8. Constants

| Constant | Value | Rationale |
|---|---|---|
| `BETA` | 1.5 | Compresses the middle; keeps the top heavy without making mid-tier acts worthless |
| `ALPHA` | 1.0 | Linear marginal discount; >1 would make overlap dominate too early |
| `GAMMA` | 2.2 | Fees rise faster than draw at the top |
| `FEE_FLOOR_RATIO` | 0.02 | Cheapest bookable act, as a fraction of budget |
| `FEE_TOP_RATIO` | 0.45 | No single act may exceed 45% of budget |
| `NEIGHBOR_K` | 50 | Qloo `take` maximum; the fullest neighborhood available |
| `UNIVERSE_CAP` | 120 | Larger unions add candidates that can never clear the budget |
| `ENRICH_TOP` | 40 | Only the shortlist needs its own neighbor set (call budget) |
| `CONCURRENCY` | 6 | Respects rate limits while keeping cold solves under ~15s |
| `SWAP_ITERS` | 200 | Converges in practice well before this |

---

## 9. Calibration procedure

Run `pnpm bench --n 20` across twenty varied briefs. Report the **distribution**, not the best case.

Then:

1. **Perturb β and γ one at a time** and re-run. If the median uplift moves more than a few points, the claim is too sensitive to a constant and must be reported as a range.
2. **Find the failure case.** Construct a specific brief where the optimizer produces a lineup a real promoter would reject. There is always one — usually a lineup that is technically diverse but has no act anyone would buy a ticket for. If you can't find it, the objective is under-constrained.
3. **Decide the headline.** Lead with the measured taste-overlap reduction; support with modeled uplift. Never lead with the model.

---

## 10. What this model does not claim

- It does not predict ticket sales, gate, or revenue.
- It does not know real fees.
- It does not measure actual audience intersection between two artists.
- It does not model day-splitting, stage clashes, radius clauses, availability, or routing.
- It does not account for the fact that a great lineup needs at least one act that makes people buy a ticket on day one. That's a human judgement and it stays with the promoter.

---

## References

- Qloo, [Insights API](https://docs.qloo.com/docs/insights-api) and [affinity score interpretation](https://docs.qloo.com/docs/interpreting-affinity-scores)
- Nemhauser, Wolsey & Fisher (1978) — `(1 − 1/e)` bound for greedy maximization of monotone submodular functions
- Krause & Golovin (2014) — *Submodular Function Maximization*, for the coverage formulation
