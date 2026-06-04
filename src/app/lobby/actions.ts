"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/auth/action-state";
import { getViewerDisplayName } from "@/lib/auth/display-name";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";
import {
  adjustBeeritsSchema,
  controlLobbySchema,
  createLobbySchema,
  joinLobbySchema,
  leaveLobbySchema,
  scoreAndAdvanceLobbySchema,
  sendLobbyMessageSchema,
} from "@/lib/validation/lobbies";

function lobbyError(message: string): ActionState {
  return { message, status: "error" };
}

async function getLobbyActor() {
  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || !supabase) {
    return null;
  }

  return {
    displayName: getViewerDisplayName(viewer),
    supabase,
  };
}

export async function createLobbyAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createLobbySchema.safeParse({
    activityKinds: formData.getAll("activityKinds"),
    activitySelectionMode: formData.get("activitySelectionMode"),
    gameId: formData.get("gameId"),
    includeCommunityCards: formData.get("includeCommunityCards") === "on",
    mixedCategories: formData.getAll("mixedCategories"),
  });
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError(
      !parsed.success
        ? (parsed.error.issues[0]?.message ?? "Check the lobby settings.")
        : "Could not create the lobby. Sign in and try again.",
    );
  }

  const { data, error } = await actor.supabase.rpc("create_lobby", {
    p_activity_kinds: parsed.data.activityKinds,
    p_activity_selection_mode: parsed.data.activitySelectionMode,
    p_display_name: actor.displayName,
    p_game_id: parsed.data.gameId,
    p_include_community_cards: parsed.data.includeCommunityCards,
    p_mixed_categories: parsed.data.mixedCategories,
  });

  if (error || typeof data !== "string") {
    if (error?.message.includes("No cards match")) {
      return lobbyError(
        "No cards match those offline game types yet. Choose another type or use a mixed lobby.",
      );
    }

    return lobbyError("Could not create this lobby. Try another game.");
  }

  revalidatePath("/lobby");
  redirect(`/lobby/${data}`);
}

export async function joinLobbyAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = joinLobbySchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Check the lobby code.",
      status: "error",
    };
  }

  if (!actor) {
    return lobbyError("Start guest mode or sign in before joining a lobby.");
  }

  const { data, error } = await actor.supabase.rpc("join_lobby_by_code", {
    p_code: parsed.data.code,
    p_display_name: actor.displayName,
  });

  if (error || typeof data !== "string") {
    return lobbyError("No waiting lobby was found for that code.");
  }

  revalidatePath("/lobby");
  redirect(`/lobby/${data}`);
}

export async function controlLobbyAction(formData: FormData) {
  const parsed = controlLobbySchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError("Could not update the lobby.");
  }

  const { error } = await actor.supabase.rpc("control_lobby", {
    p_control: parsed.data.control,
    p_lobby_id: parsed.data.lobbyId,
  });

  if (error) {
    return lobbyError("Only the host can use that gameplay control.");
  }

  revalidatePath(`/lobby/${parsed.data.lobbyId}`);
  return { status: "success" } satisfies ActionState;
}

export async function adjustBeeritsAction(formData: FormData) {
  const parsed = adjustBeeritsSchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError("Could not update the Beerits score.");
  }

  const { error } = await actor.supabase.rpc("adjust_lobby_beerits", {
    p_delta: parsed.data.delta,
    p_lobby_id: parsed.data.lobbyId,
    p_player_id: parsed.data.playerId,
  });

  if (error) {
    return lobbyError("Only the host can adjust Beerits during gameplay.");
  }

  return { status: "success" } satisfies ActionState;
}

export async function scoreAndAdvanceLobbyAction(formData: FormData) {
  const parsed = scoreAndAdvanceLobbySchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError("Could not score this player.");
  }

  const { error } = await actor.supabase.rpc("score_lobby_player_and_advance", {
    p_delta: parsed.data.delta,
    p_lobby_id: parsed.data.lobbyId,
    p_player_id: parsed.data.playerId,
  });

  if (error) {
    return lobbyError("Only the host can use quick score during active gameplay.");
  }

  return { status: "success" } satisfies ActionState;
}

export async function sendLobbyMessageAction(formData: FormData) {
  const parsed = sendLobbyMessageSchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError("Enter a message before sending.");
  }

  const { error } = await actor.supabase.rpc("send_lobby_message", {
    p_display_name: actor.displayName,
    p_lobby_id: parsed.data.lobbyId,
    p_message: parsed.data.message,
  });

  if (error) {
    return lobbyError("Could not send the message.");
  }

  return { status: "success" } satisfies ActionState;
}

export async function leaveLobbyAction(formData: FormData) {
  const parsed = leaveLobbySchema.safeParse(Object.fromEntries(formData));
  const actor = await getLobbyActor();

  if (!parsed.success || !actor) {
    return lobbyError("Could not leave the lobby.");
  }

  const { error } = await actor.supabase.rpc("leave_lobby", {
    p_lobby_id: parsed.data.lobbyId,
  });

  if (error) {
    return lobbyError("Only players in a waiting lobby can leave.");
  }

  revalidatePath("/lobby");
  redirect("/lobby");
}
