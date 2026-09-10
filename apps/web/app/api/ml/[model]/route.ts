import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

const ALLOWED_MODELS = new Set([
  "stroke",
  "anemia",
  "breastCancer",
  "diabetes",
  "heartDisease",
  "heartFailure",
  "kidneyDisease",
  "liverDisease",
]);

type RouteContext = { params: Promise<{ model: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { model } = await ctx.params;

  if (!ALLOWED_MODELS.has(model)) {
    return NextResponse.json(
      { error: `Unknown model '${model}'` },
      { status: 404 }
    );
  }

  let features: unknown;
  try {
    const body = await req.json();
    features = body.features;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !Array.isArray(features) ||
    features.length === 0 ||
    !features.every((f) => typeof f === "number" && Number.isFinite(f))
  ) {
    return NextResponse.json(
      { error: "features must be a non-empty array of numbers" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${ML_SERVICE_URL}/api/predict/${model}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ features }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.detail || "ML prediction service error" },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "ML prediction service timed out"
        : "ML prediction service unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}