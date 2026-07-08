"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/auth/action-state";
import { getViewer } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { describePostgrestError } from "@/lib/supabase/postgrest-error";
import { createClient } from "@/lib/supabase/server";
import {
  gameFormSchema,
  normalizeGameCardsPayload,
} from "@/lib/validation/games";

export async function createGameAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawPayload = formData.get("payload");

  if (typeof rawPayload !== "string") {
    return { message: "Could not read the game form.", status: "error" };
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return { message: "Could not read the game form.", status: "error" };
  }

  const parsed = gameFormSchema.safeParse(normalizeGameCardsPayload(payload));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Check the game details and cards.",
      status: "error",
    };
  }

  const viewer = await getViewer();
  const supabase = await createClient();

  if (!viewer || viewer.isAnonymous || !viewer.profile || !supabase) {
    return {
      message: "Create an account before publishing a game.",
      status: "error",
    };
  }

  const values = parsed.data;

  if (values.remixedFromGameId) {
    const { data: remixSource } = await supabase
      .from("games")
      .select("id")
      .eq("id", values.remixedFromGameId)
      .maybeSingle();

    if (!remixSource) {
      return {
        message: "The original game is not available for remixing.",
        status: "error",
      };
    }
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      category: values.category,
      concept: values.concept || null,
      creator_id: viewer.id,
      description: values.description || null,
      estimated_duration: values.estimatedDuration,
      intensity: values.intensity,
      max_players: values.maxPlayers,
      min_players: values.minPlayers,
      remixed_from_game_id: values.remixedFromGameId,
      rules: values.rules || null,
      rules_url: values.rulesUrl || null,
      title: values.title,
      visibility: values.visibility,
    })
    .select("id")
    .single();

  if (gameError || !game) {
    logDevelopmentError("Could not save the game.", gameError);
    return {
      message: describePostgrestError(
        gameError,
        "Could not save the game. Please try again.",
      ),
      status: "error",
    };
  }

  if (values.cards.length === 0) {
    revalidatePath("/browse");
    revalidatePath(`/profile/${viewer.profile.username}`);
    redirect(`/games/${game.id}`);
  }

  const { error: cardsError } = await supabase.from("game_cards").insert(
    values.cards.map((card, index) => ({
      activity_kind: card.activityKind,
      beerits_value: card.beeritsValue,
      card_type: card.cardType,
      game_id: game.id,
      intensity: card.intensity,
      position: index + 1,
      text: card.text,
      timer_behavior: card.timerBehavior,
      timer_max_seconds: card.timerMaxSeconds,
      timer_min_seconds: card.timerMinSeconds,
      timer_seconds: card.timerSeconds,
    })),
  );

  if (cardsError) {
    logDevelopmentError("Could not save the game cards.", cardsError);
    await supabase.from("games").delete().eq("id", game.id);

    return {
      message: describePostgrestError(
        cardsError,
        "Could not save the game cards. Please try again.",
      ),
      status: "error",
    };
  }

  revalidatePath("/browse");
  revalidatePath(`/profile/${viewer.profile.username}`);
  redirect(`/games/${game.id}`);
}
