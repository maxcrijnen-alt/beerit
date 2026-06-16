import type { SupabaseClient } from "@supabase/supabase-js";
import { logDevelopmentError } from "@/lib/dev-log";

export const APP_EVENT_TYPES = [
  "LOBBY_CREATED",
  "LOBBY_STARTED",
  "LOBBY_ENDED",
  "RANDOM_GAME_PICKED",
  "COMMUNITY_QUESTION_ADDED",
  "GAME_TOPIC_ADDED",
] as const;

export type AppEventType = (typeof APP_EVENT_TYPES)[number];

interface TrackAppEventInput {
  eventType: AppEventType;
  gameId?: string | null;
  lobbyId?: string | null;
}

export async function trackAppEvent(
  supabase: SupabaseClient | null,
  input: TrackAppEventInput,
) {
  if (!supabase) {
    return;
  }

  try {
    const { error } = await supabase.rpc("track_app_event", {
      p_event_type: input.eventType,
      p_game_id: input.gameId ?? null,
      p_lobby_id: input.lobbyId ?? null,
    });

    if (error) {
      logDevelopmentError("Could not track a privacy-light app event.", error);
    }
  } catch (error) {
    logDevelopmentError("Could not track a privacy-light app event.", error);
  }
}
