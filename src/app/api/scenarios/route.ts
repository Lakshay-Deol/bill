import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCached, setCached } from "@/lib/qloo/cache";

const ScenarioStateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  market: z.string().min(1).max(100).default("Austin"),
  budget: z.number().min(10000).max(10000000).default(250000),
  capacity: z.number().min(500).max(150000).default(5000),
  actCount: z.number().min(2).max(30).default(8),
  seeds: z.array(z.string().max(100)).max(10).default([]),
  mustInclude: z.array(z.string().max(100)).max(20).default([]),
  exclude: z.array(z.string().max(100)).max(50).default([]),
  requireLocal: z.boolean().default(false),
  minLocalActs: z.number().min(0).max(10).default(0),
  feeOverrides: z.record(z.number().min(0)).default({}),
});

// In-memory sliding window rate limiter: max 20 saves per minute per IP
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum 20 saves per minute." }, { status: 429 });
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ScenarioStateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid scenario payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const scenario = parseResult.data;
    const scenarioId = `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const cacheKey = `scenario:${scenarioId}`;

    // Store in Redis / memory cache for 30 days
    await setCached(cacheKey, scenario, 86400 * 30);

    return NextResponse.json({
      id: scenarioId,
      name: scenario.name,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Scenario API Error]:", err);
    return NextResponse.json({ error: "Failed to save scenario" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || !/^sc_[a-z0-9_]+$/i.test(id)) {
      return NextResponse.json({ error: "Invalid scenario ID" }, { status: 400 });
    }

    const cacheKey = `scenario:${id}`;
    const scenario = await getCached(cacheKey);

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found or expired" }, { status: 404 });
    }

    return NextResponse.json({ id, scenario });
  } catch (err) {
    console.error("[Scenario API Error]:", err);
    return NextResponse.json({ error: "Failed to load scenario" }, { status: 500 });
  }
}

