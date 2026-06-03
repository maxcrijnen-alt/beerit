import { type NextRequest, NextResponse } from "next/server";
import { withTimeout } from "@/lib/async/with-timeout";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";

const AUTH_TIMEOUT_MS = 8000;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/home";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/home";

  if (code) {
    try {
      const supabase = await createClient();

      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const { error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        AUTH_TIMEOUT_MS,
        "Account confirmation timed out.",
      );

      if (error) {
        throw error;
      }
    } catch (error) {
      logDevelopmentError("Account confirmation failed unexpectedly.", error);
      return NextResponse.redirect(
        new URL(
          "/auth?notice=Could%20not%20confirm%20your%20account.%20Please%20try%20again.",
          requestUrl.origin,
        ),
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
