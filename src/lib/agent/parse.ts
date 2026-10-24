import { z } from "zod";
import { env } from "@/lib/env";

export const ConstraintPatchSchema = z.object({
  budget: z.number().optional(),
  market: z.string().optional(),
  capacity: z.number().optional(),
  actCount: z.number().optional(),
  requireLocal: z.boolean().optional(),
  mustInclude: z.array(z.string()).optional(),
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

  // 3. Local requirement: "local", "opener", "local act"
  if (lower.includes("local") || lower.includes("opener")) {
    patch.requireLocal = true;
  }

  // 4. Capacity extraction: "cap 5000", "5000 cap", "capacity 4000"
  const capMatch = lower.match(/(?:cap|capacity)\s*(?:of|to)?\s*(\d+(?:,\d+)*)\s*(k)?/);
  if (capMatch && capMatch[1]) {
    const rawCap = parseFloat(capMatch[1].replace(/,/g, ""));
    patch.capacity = capMatch[2] === "k" ? Math.round(rawCap * 1000) : Math.round(rawCap);
  }

  // 5. Market extraction
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
  // If DeepSeek or OpenAI API key is present, attempt LLM JSON-mode parsing
  if (env.DEEPSEEK_API_KEY) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Extract festival promoter constraints from user prompt into JSON: {budget?: number, market?: string, capacity?: number, actCount?: number, requireLocal?: boolean}",
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
