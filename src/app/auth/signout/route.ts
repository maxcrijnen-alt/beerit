import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { withTimeout } from "@/lib/async/with-timeout";
import { isMissingSessionError } from "@/lib/auth/errors";
import { getGuestNameCookie } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";

const AUTH_TIMEOUT_MS = 8000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.getClaims(),
        AUTH_TIMEOUT_MS,
        "Sign out session check timed out.",
      );

      if (error && !isMissingSessionError(error)) {
        throw error;
      }

      if (data?.claims) {
        const { error: signOutError } = await withTimeout(
          supabase.auth.signOut(),
          AUTH_TIMEOUT_MS,
          "Sign out timed out.",
        );

        if (signOutError) {
          throw signOutError;
        }
      }
    } catch (error) {
      logDevelopmentError("Sign out failed unexpectedly.", error);
    }
  }

  const response = NextResponse.redirect(new URL("/auth", request.url), {
    status: 302,
  });

  response.cookies.delete(getGuestNameCookie());
  revalidatePath("/", "layout");

  return response;
}
