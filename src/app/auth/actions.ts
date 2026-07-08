"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withTimeout } from "@/lib/async/with-timeout";
import type { ActionState } from "@/lib/auth/action-state";
import { isMissingSessionError } from "@/lib/auth/errors";
import { getGuestNameCookie } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import { guestSchema, loginSchema, signupSchema } from "@/lib/validation/auth";

const AUTH_TIMEOUT_MS = 8000;

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): ActionState {
  return {
    fieldErrors,
    message: "Check the highlighted fields.",
    status: "error",
  };
}

function authError(message: string): ActionState {
  return {
    message,
    status: "error",
  };
}

function requireSupabase(
  client: Awaited<ReturnType<typeof createClient>>,
): NonNullable<Awaited<ReturnType<typeof createClient>>> {
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  return client;
}

function unavailableError(): ActionState {
  return authError(
    "Beerit could not reach the sign-in service. The game database may be paused or waking up — try again in a minute.",
  );
}

async function getCurrentClaims(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
) {
  try {
    const { data, error } = await withTimeout(
      supabase.auth.getClaims(),
      AUTH_TIMEOUT_MS,
      "Session check timed out.",
    );

    if (error) {
      if (isMissingSessionError(error)) {
        return { claims: null, failed: false };
      }

      logDevelopmentError("Could not check the current auth session.", error);
      return { claims: null, failed: true };
    }

    return { claims: data?.claims ?? null, failed: false };
  } catch (error) {
    logDevelopmentError("Could not check the current auth session.", error);
    return { claims: null, failed: true };
  }
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const supabase = requireSupabase(await createClient());
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword(parsed.data),
      AUTH_TIMEOUT_MS,
      "Sign in timed out.",
    );

    if (error) {
      return authError("Could not sign in. Check your email and password.");
    }
  } catch (error) {
    logDevelopmentError("Sign in failed unexpectedly.", error);
    return unavailableError();
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signupAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  let hasSession = false;

  try {
    const supabase = requireSupabase(await createClient());
    const currentClaims = await getCurrentClaims(supabase);

    if (currentClaims.failed) {
      return unavailableError();
    }

    if (currentClaims.claims?.is_anonymous) {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        AUTH_TIMEOUT_MS,
        "Guest sign out timed out.",
      );

      if (error) {
        throw error;
      }
    }

    const headerStore = await headers();
    const origin = headerStore.get("origin") ?? "http://localhost:3000";
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            username: parsed.data.username,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      }),
      AUTH_TIMEOUT_MS,
      "Account creation timed out.",
    );

    if (error) {
      return authError(
        "Could not create the account. Try another username or email address.",
      );
    }

    hasSession = Boolean(data.session);
  } catch (error) {
    logDevelopmentError("Account creation failed unexpectedly.", error);
    return unavailableError();
  }

  revalidatePath("/", "layout");

  if (!hasSession) {
    redirect("/auth?notice=Check your email to confirm your account.");
  }

  redirect("/home");
}

export async function continueAsGuestAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = guestSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const supabase = requireSupabase(await createClient());
    const currentClaims = await getCurrentClaims(supabase);

    if (currentClaims.failed) {
      return unavailableError();
    }

    const currentUser = currentClaims.claims;

    if (!currentUser?.sub || !currentUser.is_anonymous) {
      const { error } = await withTimeout(
        supabase.auth.signInAnonymously({
          options: {
            data: {
              display_name: parsed.data.displayName,
            },
          },
        }),
        AUTH_TIMEOUT_MS,
        "Guest mode timed out.",
      );

      if (error) {
        return authError("Could not start guest mode. Please try again.");
      }
    }
  } catch (error) {
    logDevelopmentError("Guest mode failed unexpectedly.", error);
    return unavailableError();
  }

  const cookieStore = await cookies();
  cookieStore.set(getGuestNameCookie(), parsed.data.displayName, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
  redirect("/home");
}
