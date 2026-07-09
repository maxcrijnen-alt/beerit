"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/auth/action-state";
import { getViewer } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import {
  markFriendBalanceEvenSchema,
  removeFriendshipSchema,
  respondFriendRequestSchema,
  sendFriendRequestSchema,
} from "@/lib/validation/friends";

async function getRegisteredActor() {
  const [viewer, supabase] = await Promise.all([getViewer(), createClient()]);

  if (!viewer || viewer.isAnonymous || !viewer.profile || !supabase) {
    return null;
  }

  return { supabase, viewer };
}

export async function sendFriendRequestAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sendFriendRequestSchema.safeParse(Object.fromEntries(formData));
  const actor = await getRegisteredActor();

  if (!parsed.success || !actor) {
    return { message: "Enter a registered username.", status: "error" };
  }

  try {
    const { error } = await actor.supabase.rpc("send_friend_request", {
      p_username: parsed.data.username,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    logDevelopmentError("Could not send a friend request.", error);
    return { message: "Could not send that request.", status: "error" };
  }

  revalidatePath("/friends");

  return { message: "Friend request sent.", status: "success" };
}

export async function respondFriendRequestAction(formData: FormData) {
  const parsed = respondFriendRequestSchema.safeParse(Object.fromEntries(formData));
  const actor = await getRegisteredActor();

  if (!parsed.success || !actor) {
    return;
  }

  const { error } = await actor.supabase.rpc("respond_friend_request", {
    p_accept: parsed.data.accept,
    p_friendship_id: parsed.data.friendshipId,
  });

  if (error) {
    logDevelopmentError("Could not respond to a friend request.", error);
    return;
  }

  revalidatePath("/friends");
}

export async function markFriendBalanceEvenAction(formData: FormData) {
  const parsed = markFriendBalanceEvenSchema.safeParse(
    Object.fromEntries(formData),
  );
  const actor = await getRegisteredActor();

  if (!parsed.success || !actor) {
    return;
  }

  const { error } = await actor.supabase.rpc("mark_friend_balance_even", {
    p_friendship_id: parsed.data.friendshipId,
  });

  if (error) {
    logDevelopmentError("Could not reset the fictional balance.", error);
    return;
  }

  revalidatePath("/friends");
}

export async function removeFriendshipAction(formData: FormData) {
  const parsed = removeFriendshipSchema.safeParse(Object.fromEntries(formData));
  const actor = await getRegisteredActor();

  if (!parsed.success || !actor) {
    return;
  }

  const { error } = await actor.supabase.rpc("remove_friendship", {
    p_friendship_id: parsed.data.friendshipId,
  });

  if (error) {
    logDevelopmentError("Could not remove a friendship.", error);
    return;
  }

  revalidatePath("/friends");
}
