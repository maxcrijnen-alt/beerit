import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withTimeout } from "@/lib/async/with-timeout";
import { isMissingSessionError } from "@/lib/auth/errors";
import { logDevelopmentError } from "@/lib/dev-log";
import { getSupabaseConfig } from "@/lib/supabase/config";

const SESSION_TIMEOUT_MS = 5000;

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  let response = NextResponse.next({ request });

  if (!config) {
    return response;
  }

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const { error } = await withTimeout(
      supabase.auth.getClaims(),
      SESSION_TIMEOUT_MS,
      "Session refresh timed out.",
    );

    if (error && !isMissingSessionError(error)) {
      logDevelopmentError("Could not refresh the session in the proxy.", error);
    }
  } catch (error) {
    logDevelopmentError("Could not refresh the session in the proxy.", error);
  }

  return response;
}
