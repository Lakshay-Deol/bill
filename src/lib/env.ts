import { z } from "zod";
import dotenv from "dotenv";

// Load local env files if running outside Next.js runtime (e.g. CLI scripts / tests)
dotenv.config({ path: ".env.local" });
dotenv.config();


const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    QLOO_BASE_URL: z
      .preprocess(emptyToUndefined, z.string().url().default("https://hackathon.api.qloo.com")),
    QLOO_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
    QLOO_MODE: z.enum(["live", "fixture"]).default("live"),
    UPSTASH_REDIS_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    UPSTASH_REDIS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
    DEEPSEEK_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  })

  .superRefine((data, ctx) => {
    // If running in live mode, QLOO_API_KEY must be provided
    if (data.QLOO_MODE === "live" && (!data.QLOO_API_KEY || data.QLOO_API_KEY.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["QLOO_API_KEY"],
        message: "QLOO_API_KEY is required when QLOO_MODE is 'live'. Set QLOO_MODE=fixture for offline testing.",
      });
    }
  });

function validateEnv() {
  // If running in browser client, return safe non-sensitive defaults without throwing
  if (typeof window !== "undefined") {
    return {
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
      QLOO_BASE_URL: "https://hackathon.api.qloo.com",
      QLOO_MODE: "live" as const,
      QLOO_API_KEY: undefined,
      UPSTASH_REDIS_URL: undefined,
      UPSTASH_REDIS_TOKEN: undefined,
      DEEPSEEK_API_KEY: undefined,
    };
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `[Crowdfolio] Fatal Environment Configuration Error:\n${errorDetails}\n` +
      `Check your .env.local file against .env.example.`
    );
  }
  return parsed.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
