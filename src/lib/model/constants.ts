/**
 * Constants governing the mathematical scoring model and optimization algorithms.
 * Every constant has a rationale comment explaining why it has that value.
 * Values are locked per docs/model.md.
 */

// Compresses the middle; keeps the top heavy without making mid-tier acts worthless
export const BETA = 1.5;

// Linear marginal discount; >1 would make overlap dominate too early
export const ALPHA = 1.0;

// Fees rise faster than draw at the top of the talent market (headliner premium)
export const GAMMA = 2.2;

// Minimum bookable act fee, as a fraction of the talent budget (floor = 2% of B)
export const FEE_FLOOR_RATIO = 0.02;

// Maximum fee ratio any single headliner may consume (ceiling = 45% of B)
export const FEE_TOP_RATIO = 0.45;

// Fullest Qloo neighborhood available in a single call (take=50)
export const NEIGHBOR_K = 50;

// Maximum candidate universe size; larger unions add acts that fail budget constraints
export const UNIVERSE_CAP = 120;

// Shortlist size enriched with their own full neighbor sets (preserves API call budget)
export const ENRICH_TOP = 40;

// Concurrency limit for outbound Qloo API requests
export const CONCURRENCY = 6;

// Maximum iterations for 1-swap local search hill-climbing
export const SWAP_ITERS = 200;

// Talent spend reference per attendee capacity ($50/attendee baseline)
export const TALENT_PER_CAPITA = 50;

// Standard reference capacity and budget baseline
export const BASE_REFERENCE_CAPACITY = 5000;
export const BASE_REFERENCE_BUDGET = 250_000;

// Minimum market/seed affinity threshold for candidate universe inclusion (filters zero-affinity incoherence)
export const MIN_AFFINITY_FLOOR = 0.15;
