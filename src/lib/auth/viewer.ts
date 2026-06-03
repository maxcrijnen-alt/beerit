import { cookies } from "next/headers";
import { withTimeout } from "@/lib/async/with-timeout";
import { isMissingSessionError } from "@/lib/auth/errors";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Viewer } from "@/types/database";

const GUEST_NAME_COOKIE = "beerit_guest_name";
const SESSION_TIMEOUT_MS = 6000;

function isAnonymousClaim(value: unknown) {
  return value === true || value === "true";
}

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.getClaims(),
      SESSION_TIMEOUT_MS,
      "Session lookup timed out.",
    );
    const claims = data?.claims;

    if (error) {
      if (!isMissingSessionError(error)) {
        logDevelopmentError("Could not load the current viewer.", error);
      }

      return null;
    }

    if (!claims?.sub) {
      return null;
    }

    const isAnonymous = isAnonymousClaim(claims.is_anonymous);
    const cookieStore = await cookies();
    let profile: Profile | null = null;

    if (!isAnonymous) {
      const result = await withTimeout(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", claims.sub)
          .maybeSingle<Profile>(),
        SESSION_TIMEOUT_MS,
        "Profile lookup timed out.",
      );

      if (result.error) {
        logDevelopmentError("Could not load the viewer profile.", result.error);
      }

      profile = result.data;
    }

    return {
      email: typeof claims.email === "string" ? claims.email : null,
      guestName: isAnonymous
        ? (cookieStore.get(GUEST_NAME_COOKIE)?.value ?? "Guest")
        : null,
      id: claims.sub,
      isAnonymous,
      profile,
    };
  } catch (error) {
    logDevelopmentError("Could not load the current viewer.", error);
    return null;
  }
}

export function getGuestNameCookie() {
  return GUEST_NAME_COOKIE;
}
