import { z } from "zod";

export const ConstraintPatchSchema = z.object({
  budget: z.number().optional(),
  market: z.string().optional(),
  capacity: z.number().optional(),
  actCount: z.number().optional(),
  requireLocal: z.boolean().optional(),
  minLocalActs: z.number().optional(),
  mustInclude: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  maxPerGenre: z.record(z.number()).optional(),
});

export type ConstraintPatch = z.infer<typeof ConstraintPatchSchema>;

/**
 * Deterministic rule-based constraint parser for reliable, offline, and instant NLP.
 */
function parseRuleBased(input: string): ConstraintPatch {
  const patch: ConstraintPatch = {};
  const lower = input.toLowerCase();

  // 1. Budget extraction: "$180k", "$250,000", "budget to 200k"
  const budgetMatch = lower.match(/(?:\$|budget\s+(?:to\s+)?)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|m|million|thousand)?/);
  if (budgetMatch && budgetMatch[1]) {
    const rawNum = parseFloat(budgetMatch[1].replace(/,/g, ""));
    const unit = budgetMatch[2];
    if (unit === "k" || unit === "thousand") {
      patch.budget = Math.round(rawNum * 1000);
    } else if (unit === "m" || unit === "million") {
      patch.budget = Math.round(rawNum * 1000000);
    } else {
      patch.budget = Math.round(rawNum);
    }
  }

  // 2. Act count extraction: "6 acts", "reduce lineup to 8", "10 slots"
  const actsMatch = lower.match(/(\d+)\s*(?:acts|slots|artists|bands)/) || lower.match(/(?:lineup|acts)\s+(?:to\s+)?(\d+)/);
  if (actsMatch && actsMatch[1]) {
    patch.actCount = parseInt(actsMatch[1], 10);
  }

  // 3. Local requirement & min local acts
  const minLocalMatch = lower.match(/(?:at\s+least|min(?:imum)?)\s*(\d+)\s*local/);
  if (minLocalMatch && minLocalMatch[1]) {
    patch.minLocalActs = parseInt(minLocalMatch[1], 10);
    patch.requireLocal = true;
  } else if (lower.includes("local") || lower.includes("opener")) {
    patch.requireLocal = true;
  }

  function cleanArtistName(raw: string): string {
    return raw
      .replace(/(?:\binto\b|\bon\b|\bto\b|\bfrom\b|\bthe\b|\blineup\b|\broster\b)/gi, "")
      .trim();
  }

  // 4. Lock act ("lock Mitski into the lineup", "keep Phoebe", "must include Boygenius")
  const lockMatch = input.match(/(?:lock|keep|must\s+include|require)\s+([a-zA-Z0-9\s]+?)(?:,\s*|\band\b|$|\.)/i);
  if (lockMatch && lockMatch[1]) {
    const cleaned = cleanArtistName(lockMatch[1]);
    if (cleaned && !["budget", "cap", "acts", "slots", "local"].includes(cleaned.toLowerCase())) {
      patch.mustInclude = [cleaned];
    }
  }

  // 5. Exclude act ("exclude Sharon", "no boygenius", "drop X", "remove Lucy Dacus")
  const excludeMatch = input.match(/(?:exclude|no|drop|remove|without)\s+([a-zA-Z0-9\s]+?)(?:,\s*|\band\b|$|\.)/i);
  if (excludeMatch && excludeMatch[1]) {
    const cleaned = cleanArtistName(excludeMatch[1]);
    if (cleaned && !["budget", "cap", "acts", "slots", "local"].includes(cleaned.toLowerCase())) {
      patch.exclude = [cleaned];
    }
  }

  // 6. Genre caps ("max 2 indie", "at most 3 rock", "cap rock at 2")
  const genreCapMatch = lower.match(/(?:max(?:imum)?|at\s+most|cap)\s*(\d+)?\s*([a-zA-Z\s]+?)(?:\s+at\s+(\d+))?(?:,\s*|$|\.)/);
  if (genreCapMatch) {
    const capNum = genreCapMatch[1] ? parseInt(genreCapMatch[1], 10) : genreCapMatch[3] ? parseInt(genreCapMatch[3], 10) : undefined;
    const genreName = genreCapMatch[2]?.trim().toLowerCase();
    if (capNum !== undefined && genreName && !["acts", "slots", "budget", "cap", "local"].includes(genreName)) {
      patch.maxPerGenre = { [genreName]: capNum };
    }
  }

  // 7. Capacity extraction: "cap 5000", "5000 cap", "capacity 4000"
  const capMatch = lower.match(/(?:cap|capacity)\s*(?:of|to)?\s*(\d+(?:,\d+)*)\s*(k)?/);
  if (capMatch && capMatch[1]) {
    const rawCap = parseFloat(capMatch[1].replace(/,/g, ""));
    patch.capacity = capMatch[2] === "k" ? Math.round(rawCap * 1000) : Math.round(rawCap);
  }

  // 8. Market extraction
  if (lower.includes("austin")) patch.market = "Austin";
  if (lower.includes("brooklyn") || lower.includes("new york")) patch.market = "New York";
  if (lower.includes("chicago")) patch.market = "Chicago";
  if (lower.includes("los angeles") || lower.includes("la")) patch.market = "Los Angeles";

  return patch;
}

/**
 * Parses user natural language request into structured brief constraint updates.
 */
export async function parseConstraintEdit(naturalLanguagePrompt: string): Promise<ConstraintPatch> {
  const apiKey =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY
      : undefined;

  // If DeepSeek or OpenAI API key is present, attempt LLM JSON-mode parsing
  if (apiKey) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Extract festival promoter constraints from user prompt into JSON: {budget?: number, market?: string, capacity?: number, actCount?: number, requireLocal?: boolean, minLocalActs?: number, mustInclude?: string[], exclude?: string[], maxPerGenre?: Record<string, number>}",
            },
            {
              role: "user",
              content: naturalLanguagePrompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = ConstraintPatchSchema.safeParse(parsed);
          if (validated.success && Object.keys(validated.data).length > 0) {
            return validated.data;
          }
        }
      }
    } catch {
      // Fallback cleanly to deterministic rule-based parser on any network or API issue
    }
  }

  // Fallback to deterministic regex-based parser
  return parseRuleBased(naturalLanguagePrompt);
}
