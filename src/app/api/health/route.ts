import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type HealthStatus = "ok" | "configuration_warning";

function getCommitSha() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null;
}

function getBranchName() {
  return process.env.VERCEL_GIT_COMMIT_REF ?? null;
}

export function GET() {
  const hasSupabasePublicConfig = getSupabaseConfig() !== null;
  const status: HealthStatus = hasSupabasePublicConfig
    ? "ok"
    : "configuration_warning";

  return NextResponse.json(
    {
      app: "beerit",
      checks: {
        supabasePublicConfig: hasSupabasePublicConfig
          ? "configured"
          : "missing",
      },
      deployment: {
        branch: getBranchName(),
        commitSha: getCommitSha(),
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      },
      status,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
