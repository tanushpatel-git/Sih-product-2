import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${ML_SERVICE_URL}/api/capacity/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || data.error) {
      return NextResponse.json(
        { error: data.detail || data.error || "Capacity forecasting service error" },
        { status: upstream.status || 422 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Capacity forecasting service timed out"
      : "Capacity forecasting service unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
