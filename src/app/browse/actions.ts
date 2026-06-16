"use server";

import { logDevelopmentError } from "@/lib/dev-log";
import { trackAppEvent } from "@/lib/analytics/events";
import { createClient } from "@/lib/supabase/server";
import {
  pickRandomGameSchema,
  type PickRandomGameValues,
} from "@/lib/validation/discovery";

interface PickRandomGameResult {
  gameId: string | null;
  message: string;
  status: "error" | "success";
}

async function runPickRandomGameRpc(
  values: PickRandomGameValues,
  excludedGameIds: string[],
) {
  const supabase = await createClient();

  if (!supabase) {
    return {
      data: null,
      error: new Error("Supabase is not configured."),
      supabase: null,
    };
  }

  const { data, error } = await supabase.rpc("pick_random_game", {
    p_categories: values.category === "ALL" ? [] : [values.category],
    p_content_mode: values.contentMode,
    p_duration_max_minutes: values.durationMaxMinutes,
    p_excluded_game_ids: excludedGameIds,
    p_intensities: values.intensity === "ALL" ? [] : [values.intensity],
    p_player_count: values.players,
    p_pool: values.pool,
    p_query: values.query,
  });

  return { data, error, supabase };
}

export async function pickRandomGameAction(
  values: PickRandomGameValues,
): Promise<PickRandomGameResult> {
  const parsed = pickRandomGameSchema.safeParse(values);

  if (!parsed.success) {
    return {
      gameId: null,
      message: "Check your random filters and try again.",
      status: "error",
    };
  }

  try {
    const firstPick = await runPickRandomGameRpc(
      parsed.data,
      parsed.data.recentRandomGameIds,
    );

    if (firstPick.error) {
      throw firstPick.error;
    }

    if (typeof firstPick.data === "string") {
      await trackAppEvent(firstPick.supabase, {
        eventType: "RANDOM_GAME_PICKED",
        gameId: firstPick.data,
      });

      return {
        gameId: firstPick.data,
        message: "Random game picked.",
        status: "success",
      };
    }

    if (parsed.data.recentRandomGameIds.length > 0) {
      const retryPick = await runPickRandomGameRpc(parsed.data, []);

      if (retryPick.error) {
        throw retryPick.error;
      }

      if (typeof retryPick.data === "string") {
        await trackAppEvent(retryPick.supabase, {
          eventType: "RANDOM_GAME_PICKED",
          gameId: retryPick.data,
        });

        return {
          gameId: retryPick.data,
          message: "All matching games were recent, so one was reused.",
          status: "success",
        };
      }
    }

    return {
      gameId: null,
      message: "No public games match those random filters.",
      status: "error",
    };
  } catch (error) {
    logDevelopmentError("Could not pick a random game on the server.", error);
    return {
      gameId: null,
      message: "Server random pick is unavailable. Trying a local pick instead.",
      status: "error",
    };
  }
}
