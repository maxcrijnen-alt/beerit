"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/auth/action-state";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/auth";

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Check the highlighted fields.",
      status: "error",
    };
  }

  const viewer = await getViewer();
  const supabase = await createClient();

  if (!viewer || viewer.isAnonymous || !supabase) {
    return {
      message: "Create an account before editing a permanent profile.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
      username: parsed.data.username,
    })
    .eq("id", viewer.id);

  if (error) {
    return {
      message: "Could not save the profile. The username may already be taken.",
      status: "error",
    };
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${parsed.data.username}`);

  return {
    message: "Profile updated.",
    status: "success",
  };
}
