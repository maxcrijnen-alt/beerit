"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { sendFriendRequestAction } from "@/app/friends/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";

export function AddFriendForm() {
  const [state, action, pending] = useActionState(
    sendFriendRequestAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={action} className="space-y-3">
      <Input
        aria-label="Friend username"
        autoCapitalize="none"
        name="username"
        placeholder="Username"
        required
      />
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-xs text-muted-foreground"
              : "text-xs text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        <UserPlus className="size-4" />
        {pending ? "Sending..." : "Send friend request"}
      </Button>
    </form>
  );
}
