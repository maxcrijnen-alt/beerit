"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import {
  communityGameCardSchema,
  type CommunityGameCardValues,
} from "@/lib/validation/games";
import {
  moderateGameSchema,
  reportGameSchema,
  setGameCardVoteSchema,
  setGameVoteSchema,
  toggleSavedGameSchema,
  type ReportGameValues,
} from "@/lib/validation/social";
import type { GameVoteType } from "@/types/database";

interface SocialActionResult<T = undefined> {
  data?: T;
  message: string;
  status: "error" | "success";
}

function revalidateSocialPages(gameId: string) {
  revalidatePath("/browse");
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/admin/moderation");
}

export async function submitCommunityGameCardAction(
  values: CommunityGameCardValues,
): Promise<SocialActionResult> {
  const parsed = communityGameCardSchema.safeParse(values);

  if (!parsed.success) {
    return { message: "Check your question and try again.", status: "error" };
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || !supabase) {
    return {
      message: "Sign in or start guest mode before adding a question.",
      status: "error",
    };
  }

  const { error } = await supabase.rpc("submit_community_game_card", {
    p_game_id: parsed.data.gameId,
    p_intensity: parsed.data.intensity,
    p_text: parsed.data.text,
  });

  if (error) {
    logDevelopmentError("Could not submit a community question.", error);
    return { message: "Could not add your question. Try again.", status: "error" };
  }

  revalidateSocialPages(parsed.data.gameId);

  return { message: "Question added.", status: "success" };
}

export async function setGameCardVoteAction(
  gameCardId: string,
  voteType: GameVoteType,
): Promise<SocialActionResult<{ vote: GameVoteType | null }>> {
  const parsed = setGameCardVoteSchema.safeParse({ gameCardId, voteType });

  if (!parsed.success) {
    return { message: "Choose a valid vote.", status: "error" };
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || !supabase) {
    return { message: "Sign in or start guest mode before voting.", status: "error" };
  }

  const { data, error } = await supabase.rpc("set_game_card_vote", {
    p_game_card_id: parsed.data.gameCardId,
    p_vote_type: parsed.data.voteType,
  });

  if (error) {
    logDevelopmentError("Could not update a card vote.", error);
    return { message: "Could not update your vote. Try again.", status: "error" };
  }

  revalidatePath("/browse");

  return {
    data: { vote: (data as GameVoteType | null) ?? null },
    message: data ? "Vote saved." : "Vote removed.",
    status: "success",
  };
}

export async function setGameVoteAction(
  gameId: string,
  voteType: GameVoteType,
): Promise<SocialActionResult<{ vote: GameVoteType | null }>> {
  const parsed = setGameVoteSchema.safeParse({ gameId, voteType });

  if (!parsed.success) {
    return { message: "Choose a valid vote.", status: "error" };
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || !supabase) {
    return { message: "Sign in or start guest mode before voting.", status: "error" };
  }

  const { data, error } = await supabase.rpc("set_game_vote", {
    p_game_id: parsed.data.gameId,
    p_vote_type: parsed.data.voteType,
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  revalidateSocialPages(parsed.data.gameId);

  return {
    data: { vote: (data as GameVoteType | null) ?? null },
    message: data ? "Vote saved." : "Vote removed.",
    status: "success",
  };
}

export async function toggleSavedGameAction(
  gameId: string,
): Promise<SocialActionResult<{ isSaved: boolean }>> {
  const parsed = toggleSavedGameSchema.safeParse({ gameId });

  if (!parsed.success) {
    return { message: "Choose a valid game.", status: "error" };
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || viewer.isAnonymous || !viewer.profile || !supabase) {
    return { message: "Create an account before saving games.", status: "error" };
  }

  const { data, error } = await supabase.rpc("toggle_saved_game", {
    p_game_id: parsed.data.gameId,
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  revalidateSocialPages(parsed.data.gameId);

  return {
    data: { isSaved: Boolean(data) },
    message: data ? "Game saved." : "Game removed from saved games.",
    status: "success",
  };
}

export async function submitGameReportAction(
  values: ReportGameValues,
): Promise<SocialActionResult> {
  const parsed = reportGameSchema.safeParse(values);

  if (!parsed.success) {
    return { message: "Check the report details.", status: "error" };
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || !supabase) {
    return {
      message: "Sign in or start guest mode before reporting.",
      status: "error",
    };
  }

  const { error } = await supabase.rpc("submit_game_report", {
    p_details: parsed.data.details,
    p_game_id: parsed.data.gameId,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return { message: error.message, status: "error" };
  }

  revalidateSocialPages(parsed.data.gameId);

  return { message: "Report sent for review.", status: "success" };
}

export async function moderateGameAction(formData: FormData) {
  const parsed = moderateGameSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (viewer?.profile?.role !== "ADMIN" || !supabase) {
    return;
  }

  const { error } = await supabase.rpc("moderate_game", {
    p_game_id: parsed.data.gameId,
    p_hidden: parsed.data.hidden,
  });

  if (error) {
    throw new Error(`Could not moderate game: ${error.message}`);
  }

  revalidateSocialPages(parsed.data.gameId);
}
