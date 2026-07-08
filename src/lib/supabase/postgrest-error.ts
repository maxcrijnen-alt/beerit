interface PostgrestErrorLike {
  code?: string | null;
  message?: string | null;
}

const MIGRATION_CODES = new Set(["42703", "42P01", "42883"]);

/**
 * Translate a PostgREST/Postgres error into a message the player can act on,
 * instead of a generic "try again" that hides schema or permission problems.
 */
export function describePostgrestError(
  error: PostgrestErrorLike | null | undefined,
  fallback: string,
): string {
  if (!error) {
    return fallback;
  }

  const code = error.code ?? "";

  if (MIGRATION_CODES.has(code)) {
    return "The Beerit database is missing recent updates. Ask the app owner to apply the latest Supabase migrations, then try again.";
  }

  if (code === "23514") {
    return "One of the values is outside the allowed range. Check the category, players, duration, and card values, then try again.";
  }

  if (code === "23505") {
    return "This looks like a duplicate. Change the details slightly and try again.";
  }

  if (code === "42501" || code === "PGRST301") {
    return "You do not have permission for this action. Sign in with the account that owns this game.";
  }

  if (code === "23503") {
    return "A linked item no longer exists. Refresh the page and try again.";
  }

  return fallback;
}
