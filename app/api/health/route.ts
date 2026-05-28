import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { architectureSummary } from "@/lib/presentation";

export const runtime = "nodejs";

export async function GET() {
  const env = readEnv();

  return NextResponse.json({
    status: "ok",
    service: "tumbfolio",
    runtime: "nodejs",
    stack: {
      app: "Next.js",
      language: "TypeScript",
      backend: "Next API routes + Node workers"
    },
    env: env.success ? "valid" : "invalid_or_incomplete",
    architecture: architectureSummary
  });
}
