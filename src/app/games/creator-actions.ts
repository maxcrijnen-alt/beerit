"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/auth/action-state";
import { getViewer } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { describePostgrestError } from "@/lib/supabase/postgrest-error";
import { createClient } from "@/lib/supabase/server";
import {
  addGameCardsSchema,
  normalizeGameCardsPayload,
  updateGameConceptSchema,
} from "@/lib/validation/games";

function readPayload(formData: FormData) {
  const rawPayload = formData.get("payload");

  if (typeof rawPayload !== "string") {
    return null;
  }

  try {
    return JSON.parse(rawPayload) as unknown;
  } catch {
    return null;
  }
}

async function getRegisteredCreator() {
  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || viewer.isAnonymous || !viewer.profile || !supabase) {
    return null;
  }

  return { profile: viewer.profile, supabase, viewer };
}

export async function addGameCardsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = addGameCardsSchema.safeParse(
    normalizeGameCardsPayload(readPayload(formData)),
  );

  if (!parsed.success) {
    return {
      message: "Check the new cards and try again.",
      status: "error",
    };
  }

  const creator = await getRegisteredCreator();

  if (!creator) {
    return {
      message: "Create an account before adding cards.",
      status: "error",
    };
  }

  const { gameId, cards } = parsed.data;
  const { profile, supabase, viewer } = creator;

  try {
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, creator_id")
      .eq("id", gameId)
      .maybeSingle<{ creator_id: string | null; id: string }>();

    if (gameError) {
      throw gameError;
    }

    if (!game || game.creator_id !== viewer.id) {
      return {
        message: "Only the creator can add cards to this game.",
        status: "error",
      };
    }

    const [officialCardsResult, lastCardResult] = await Promise.all([
      supabase
        .from("game_cards")
        .select("id", { count: "exact", head: true })
        .eq("game_id", gameId)
        .eq("is_community", false),
      supabase
        .from("game_cards")
        .select("position")
        .eq("game_id", gameId)
        .order("position", { ascending: false })
        .limit(1),
    ]);

    if (officialCardsResult.error || lastCardResult.error) {
      throw officialCardsResult.error ?? lastCardResult.error;
    }

    if ((officialCardsResult.count ?? 0) + cards.length > 100) {
      return {
        message: "A game can contain at most 100 cards.",
        status: "error",
      };
    }

    const lastPosition = lastCardResult.data?.[0]?.position ?? 0;
    const { error: insertError } = await supabase.from("game_cards").insert(
      cards.map((card, index) => ({
        activity_kind: card.activityKind,
        beerits_value: card.beeritsValue,
        card_type: card.cardType,
        game_id: gameId,
        intensity: card.intensity,
        position: lastPosition + index + 1,
        text: card.text,
        timer_behavior: card.timerBehavior,
        timer_max_seconds: card.timerMaxSeconds,
        timer_min_seconds: card.timerMinSeconds,
        timer_seconds: card.timerSeconds,
      })),
    );

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    logDevelopmentError("Could not add cards to the game.", error);
    return {
      message: describePostgrestError(
        error as { code?: string; message?: string },
        "Could not add the cards. Please try again.",
      ),
      status: "error",
    };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/edit`);
  revalidatePath("/browse");
  revalidatePath(`/profile/${profile.username}`);
  redirect(`/games/${gameId}`);
}

export async function updateGameConceptAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateGameConceptSchema.safeParse(readPayload(formData));

  if (!parsed.success) {
    return {
      message: "Use at most 120 characters for your concept.",
      status: "error",
    };
  }

  const creator = await getRegisteredCreator();

  if (!creator) {
    return {
      message: "Create an account before updating a concept.",
      status: "error",
    };
  }

  const { concept, gameId } = parsed.data;
  const { supabase, viewer } = creator;

  try {
    const { data: game, error } = await supabase
      .from("games")
      .update({ concept: concept || null })
      .eq("id", gameId)
      .eq("creator_id", viewer.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!game) {
      return {
        message: "Only the creator can update this concept.",
        status: "error",
      };
    }
  } catch (error) {
    logDevelopmentError("Could not update the game concept.", error);
    return {
      message: "Could not update the concept. Please try again.",
      status: "error",
    };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/edit`);
  revalidatePath("/browse");

  return {
    message: "Concept saved.",
    status: "success",
  };
}
